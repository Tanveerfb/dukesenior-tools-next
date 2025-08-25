"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPostBySlug, addComment, reactToPostForUser, reactToCommentForUser, listenPost, listenComments, getUserPostReaction, getUserCommentReaction } from '@/lib/services/cms';
import { getSamplePostBySlug } from '@/lib/content/samplePosts';
import { Container, Badge, Spinner, Button, Form, Collapse, Row, Col, Card, Modal } from 'react-bootstrap';
import { FaTwitch } from 'react-icons/fa';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import { useAuth } from '@/hooks/useAuth';
import styles from './post.module.css';

async function copyToClipboard(text: string){
  try{ if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(text); return true; } }catch(e){}
  try{ (document as any).execCommand('copy'); return true; }catch(e){}
  return false;
}

interface CommentNode { id:string; content:string; authorName:string; createdAt:number; likeCount:number; dislikeCount:number; replies?: CommentNode[]; parentId?: string | null; userReaction?: 'like'|'dislike'; }

function transformEmbeds(markdown: string){
  // Replace HTML comments markers with actual embed-friendly HTML blocks.
  // YouTube format: <!-- YT: https://www.youtube.com/watch?v=VIDEO_ID -->
  // Twitch format: <!-- TWITCH: channel_name -->
  return markdown
    .replace(/<!--\s*YT:\s*(https?:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,}))\s*-->/g, (_m, full, _vid, offset, str) => {
      const url = full.trim();
      const vidMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
      const id = vidMatch? vidMatch[1] : '';
      if(!id) return full;
      return `\n<div class=\"ratio ratio-16x9 my-3\"><iframe src=\"https://www.youtube.com/embed/${id}\" title=\"YouTube video\" allowfullscreen loading=\"lazy\"></iframe></div>\n`;
    })
      .replace(/<!--\s*TWITCH:\s*([a-zA-Z0-9_]{3,25})\s*-->/g, (_m, channel) => {
        const c = channel.trim();
        // Render a lightweight Twitch channel badge (link) instead of embedding the player.
    return `\n<div class="twitch-badge my-3"><a class="twitch-link" href="https://www.twitch.tv/${c}" target="_blank" rel="noreferrer noopener"><span>Visit ${c}'s Twitch channel</span></a></div>\n`;
      });
}

function estimateReadTime(text = ''){
  const words = (text || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function extractHeadings(markdown = ''){
  const re = /^#{1,4}\s+(.*)$/gm;
  const items: { level:number; text:string; id:string }[] = [];
  let m;
  while((m = re.exec(markdown))){
    const full = m[1].trim();
    const id = full.toLowerCase().replace(/[^a-z0-9\- ]/g,'').replace(/\s+/g,'-');
    const hashes = (m[0].match(/^#+/) || ['#'])[0];
    const level = hashes.length;
    items.push({ level, text: full, id });
  }
  return items;
}

export default function PostView(){
  const { slug } = useParams<{ slug: string }>();
  const [loading,setLoading] = useState(true);
  const [post,setPost] = useState<any>();
  const [comments,setComments] = useState<CommentNode[]>([]);
  const [newComment,setNewComment] = useState('');
  const [posting,setPosting] = useState(false);
  const [userPostReaction,setUserPostReaction] = useState<'like'|'dislike'|undefined>();
  const { user } = useAuth();
  const [copied,setCopied] = useState(false);
  const [commentError, setCommentError] = useState<string|undefined>();
  // Sanitization schema to allow iframe elements for embeds
  const sanitizeSchema = {
    tagNames: ['iframe','div','a','svg','path','span'],
    attributes: {
      iframe: ['src','title','allow','frameborder','allowfullscreen','loading','scrolling'],
      div: ['class','className'],
      a: ['href','target','rel','class','className','aria-label'],
      svg: ['xmlns','viewBox','width','height','fill','aria-hidden','class'],
      path: ['d','fill','stroke'],
      span: ['class','className'],
      '*': ['class','className','id','style']
    },
    protocols: {
      href: ['http','https']
    }
  } as any;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | null>(null);
  const [gallery, setGallery] = useState<{src:string; alt:string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  function openLightbox(src?: string | null, alt?: string | null){
    if(!src) return;
    const idx = gallery.findIndex(g=> g.src === src);
    if(idx >= 0){
      setCurrentIndex(idx);
      setLightboxSrc(gallery[idx].src);
      setLightboxAlt(gallery[idx].alt);
      setLightboxOpen(true);
      return;
    }
    const next = [...gallery, { src, alt: alt || '' }];
    setGallery(next);
    const newIndex = next.length - 1;
    setCurrentIndex(newIndex);
    setLightboxSrc(src);
    setLightboxAlt(alt || '');
    setLightboxOpen(true);
  }

  function openLightboxByIndex(index: number){
    const it = gallery[index];
    if(!it) return;
    setCurrentIndex(index);
    setLightboxSrc(it.src);
    setLightboxAlt(it.alt);
    setLightboxOpen(true);
  }

  function gotoPrev(){ if(gallery.length===0) return; const next = (currentIndex - 1 + gallery.length) % gallery.length; openLightboxByIndex(next); }
  function gotoNext(){ if(gallery.length===0) return; const next = (currentIndex + 1) % gallery.length; openLightboxByIndex(next); }

  useEffect(()=> {
    let unsubPost: undefined | (()=>void);
    let unsubComments: undefined | (()=>void);
    async function init(){
      setLoading(true);
      try {
        const base = await getPostBySlug(slug) || getSamplePostBySlug(slug);
        if(!base){ setPost(undefined); return; }
        setPost(base);
        // Build image gallery from fetched post (banner + markdown/html images)
        try{
          const items: {src:string; alt:string}[] = [];
          if(base.bannerUrl) items.push({ src: base.bannerUrl, alt: base.title || '' });
          const md = base.content || '';
          const mdImgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
          let m: RegExpExecArray | null;
          while((m = mdImgRe.exec(md))){ items.push({ src: m[2], alt: m[1] || '' }); }
          const htmlImgRe = /<img[^>]+src=(?:"|')?([^"'>\s]+)(?:"|')?[^>]*>/g;
          while((m = htmlImgRe.exec(md))){ items.push({ src: m[1], alt: '' }); }
          const seen = new Set<string>();
          const dedup: {src:string; alt:string}[] = [];
          for(const it of items){ if(!seen.has(it.src)){ seen.add(it.src); dedup.push(it); } }
          setGallery(dedup);
          setCurrentIndex(dedup.length? 0 : -1);
        }catch(e){ /* ignore gallery parsing errors */ }
        const isSample = base.id.startsWith('sample-');
        if(!isSample){
          if(user) { setUserPostReaction(await getUserPostReaction(base.id, user.uid)); }
          unsubPost = listenPost(base.id, async updated => { if(updated) setPost((prev: any)=> ({...(prev||{}), ...updated})); });
          unsubComments = listenComments(base.id, async list => {
            const roots = list.filter(c=> !c.parentId);
            const childrenMap: Record<string, CommentNode[]> = {};
            list.filter(c=> c.parentId).forEach(c=> { (childrenMap[c.parentId!] ||= []).push({...c}); });
            const enriched: CommentNode[] = await Promise.all(roots.map(async r => {
              let userReaction: 'like'|'dislike'|undefined = undefined;
              if(user){ userReaction = await getUserCommentReaction(r.id, user.uid); }
              return { ...r, userReaction, replies: (childrenMap[r.id]||[]) };
            }));
            setComments(enriched);
          });
        }
      } finally { setLoading(false); }
    }
    init();
    return ()=> { unsubPost && unsubPost(); unsubComments && unsubComments(); };
  },[slug, user]);

  // keyboard navigation for lightbox
  useEffect(()=>{
    if(!lightboxOpen) return;
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape') { setLightboxOpen(false); }
      else if(e.key === 'ArrowLeft') { gotoPrev(); }
      else if(e.key === 'ArrowRight') { gotoNext(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, currentIndex, gallery]);

  const readTime = estimateReadTime(post?.content || '');
  const headings = extractHeadings(post?.content || '');

  async function submit(parentId?: string){
    if(!user || !post) return;
    if(!newComment.trim()) return;
    setPosting(true);
    setCommentError(undefined);
    try {
      await addComment(user.uid, user.email||'unknown', { postId: post.id, parentId, content: newComment.trim() });
      setNewComment('');
    } catch(err:any){
      console.error('Add comment failed', err);
      setCommentError('Failed to post comment: ' + (err?.message||'unknown'));
    } finally { setPosting(false); }
  }

  function renderContent(md: string){ return transformEmbeds(md); }

  if(loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  if(!post) return <Container className="py-5"><div className="text-muted">Post not found.</div></Container>;

  return (
    <>
    <Container className={`py-4 post-view ${styles.postWrap}`}>
      <Row>
        <Col lg={8} className={styles.contentColumn}>
          <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
            {post.tags?.map((t:string)=> <Badge key={t} bg="info" className="me-2">{t}</Badge>)}
            {post.pinned && <Badge bg="warning" text="dark">Pinned</Badge>}
            <div className="ms-auto small text-muted">{new Date(post.createdAt).toLocaleString()}</div>
          </div>

          <h1 className="mb-2">{post.title} {post.id && post.id.startsWith('sample-') && <Badge bg="secondary" className="ms-2">Sample</Badge>}</h1>
          <div className="text-muted small mb-3">{post.author || 'DukeSenior'} • {readTime} min read</div>

          <div className="markdown-body mb-5" id="article-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeSlug]}
              components={{
                h2: ({node, ...props}) => (
                  <h2 {...props}>
                    {props.children}
                    <a className={styles.headingAnchor} href={`#${(props.children as any).toString().toLowerCase().replace(/[^a-z0-9\- ]/g,'').replace(/\s+/g,'-')}`} onClick={(e)=>{ e.preventDefault(); copyToClipboard(window.location.href.split('#')[0] + '#' + (props.children as any).toString().toLowerCase().replace(/[^a-z0-9\- ]/g,'').replace(/\s+/g,'-')); setCopied(true); setTimeout(()=> setCopied(false),1200);}}>🔗</a>
                  </h2>
                ) as any,
                a: ({node, ...props}: any) => {
                  const href = props.href as string | undefined;
                  const className = props.className as string | undefined;
                  if(className && className.includes('twitch-link')){
                    return (
                      <a href={href} target="_blank" rel="noreferrer noopener" className={props.className}>
                        <FaTwitch style={{marginRight:8}} />
                        <span>{props.children}</span>
                      </a>
                    );
                  }
                  return <a {...props} />;
                },
                      img: (props:any) => {
                        const src = props.src as string;
                        const alt = props.alt as string | undefined;
                        // Use next/image for better performance; keep click-to-open behavior
                        return (
                          <div style={{cursor:'pointer', maxWidth:'100%', position:'relative'}} onClick={()=> openLightbox(src, alt || '')}>
                            <Image src={src} alt={alt || 'image'} width={800} height={450} style={{maxWidth:'100%', height:'auto'}} unoptimized />
                          </div>
                        );
                      }
              }}
            >{renderContent(post.content)}</ReactMarkdown>
          </div>
        </Col>

        <Col lg={4} className={styles.sidebar}>
          <div className={styles.stickySidebar}>
            {post.bannerUrl && (
              <div className={styles.bannerPreview} style={{position:'relative'}}>
                <div role="button" style={{cursor:'pointer'}} onClick={()=> openLightbox(post.bannerUrl, post.title)}>
                  <Image src={post.bannerUrl} alt={post.title} width={1200} height={600} style={{width:'100%', height:'auto'}} unoptimized />
                </div>
              </div>
            )}
            <Card className="mb-3">
              <Card.Body>
                <h6>On this page</h6>
                <ul className={styles.tocList}>
                  {headings.map(h=> <li key={h.id} style={{marginLeft: (h.level-1)*8}}><a className={styles.tocLink} href={`#${h.id}`}>{h.text}</a></li>)}
                </ul>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body>
                <h6>Share</h6>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-primary" onClick={()=> copyToClipboard(window.location.href)}>Copy link</Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
      {!post.id.startsWith('sample-') && (
        <div className="d-flex align-items-center gap-2 mb-4">
          <Button size="sm" variant={userPostReaction==='like'? 'success':'outline-success'} disabled={!user} onClick={async ()=> { if(!user) return; await reactToPostForUser(post.id, user.uid, 'like'); setUserPostReaction('like'); }}>👍 {post.likeCount}</Button>
          <Button size="sm" variant={userPostReaction==='dislike'? 'danger':'outline-danger'} disabled={!user} onClick={async ()=> { if(!user) return; await reactToPostForUser(post.id, user.uid, 'dislike'); setUserPostReaction('dislike'); }}>👎 {post.dislikeCount}</Button>
        </div>
      )}
      <section className="mb-5">
        <h4 className="mb-3">Comments ({post.commentCount})</h4>
        {post.id.startsWith('sample-') ? <div className="text-muted small mb-3">Comments disabled for sample post.</div> : user ? (
          <Form onSubmit={e=> { e.preventDefault(); submit(); }} className="mb-4">
            <Form.Group className="mb-2"><Form.Control as="textarea" rows={3} value={newComment} onChange={e=> setNewComment(e.target.value)} placeholder="Write a comment..." /></Form.Group>
            <Button size="sm" disabled={!newComment.trim()||posting} type="submit">{posting? 'Posting...':'Post Comment'}</Button>
          </Form>
        ) : <div className="text-muted small mb-3">Login to comment.</div>}
        {!post.id.startsWith('sample-') && (
          <div className="comments-tree">
            {comments.map(c => <CommentItem key={c.id} node={c} postId={post.id} />)}
            {comments.length===0 && <div className="text-muted small fst-italic">No comments yet.</div>}
          </div>
        )}
      </section>
    </Container>
      <Modal show={lightboxOpen} onHide={()=> setLightboxOpen(false)} centered size="lg" aria-label="Image viewer">
        <Modal.Header closeButton>
          <Modal.Title>{lightboxAlt || ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0" style={{position:'relative'}}>
          {lightboxSrc && (
            <div style={{position:'relative', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#000'}}>
              <Image src={lightboxSrc} alt={lightboxAlt || ''} width={1200} height={800} style={{maxWidth:'100%', maxHeight:'80vh', width:'auto', height:'auto'}} unoptimized />

              {/* Prev button */}
              {gallery.length > 1 && (
                <button aria-label="Previous image" onClick={gotoPrev} style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', border:'none', color:'#fff', padding:'8px 10px', borderRadius:6, cursor:'pointer'}}>
                  ◀
                </button>
              )}

              {/* Next button */}
              {gallery.length > 1 && (
                <button aria-label="Next image" onClick={gotoNext} style={{position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', border:'none', color:'#fff', padding:'8px 10px', borderRadius:6, cursor:'pointer'}}>
                  ▶
                </button>
              )}
            </div>
          )}
        </Modal.Body>
        {gallery.length > 0 && (
          <Modal.Footer className="justify-content-center">
            <small className="text-muted">{currentIndex+1} / {gallery.length}</small>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
}

function CommentItem({ node, postId }: { node: CommentNode; postId: string; }){
  const { user } = useAuth();
  const [replyOpen,setReplyOpen] = useState(false);
  const [reply,setReply] = useState('');
  const [working,setWorking] = useState(false);
  const [userReaction,setUserReaction] = useState<'like'|'dislike'|undefined>(node.userReaction);
  const [likeCount,setLikeCount] = useState(node.likeCount);
  const [dislikeCount,setDislikeCount] = useState(node.dislikeCount);
  async function react(type: 'like'|'dislike'){
    if(!user) return;
    if(userReaction === type) return; // no toggle off for simplicity
    await reactToCommentForUser(node.id, user.uid, type);
    // optimistic update
    setLikeCount(c=> c + (type==='like'?1:0) - (userReaction==='like'?1:0));
    setDislikeCount(c=> c + (type==='dislike'?1:0) - (userReaction==='dislike'?1:0));
    setUserReaction(type);
  }
  async function submit(){ if(!user || !reply.trim()) return; setWorking(true); try { await addComment(user.uid, user.email||'unknown', { postId, parentId: node.id, content: reply.trim() }); setReply(''); setReplyOpen(false); } finally { setWorking(false);} }
  return (
    <div className="mb-3">
      <div className="p-2 border rounded bg-body-tertiary">
        <div className="d-flex align-items-center gap-2 small text-muted mb-1"><strong className="text-body">{node.authorName}</strong><span>{new Date(node.createdAt).toLocaleString()}</span></div>
        <div className="small mb-2" style={{whiteSpace:'pre-wrap'}}>{node.content}</div>
        <div className="d-flex gap-2">
          <Button size="sm" variant={userReaction==='like'? 'success':'outline-success'} disabled={!user} onClick={()=> react('like')}>👍 {likeCount}</Button>
          <Button size="sm" variant={userReaction==='dislike'? 'danger':'outline-danger'} disabled={!user} onClick={()=> react('dislike')}>👎 {dislikeCount}</Button>
          {user && <Button size="sm" variant="outline-primary" onClick={()=> setReplyOpen(o=> !o)}>Reply</Button>}
        </div>
        <Collapse in={replyOpen}>
          <div>
            <Form className="mt-2" onSubmit={e=> { e.preventDefault(); submit(); }}>
              <Form.Control as="textarea" rows={2} value={reply} onChange={e=> setReply(e.target.value)} placeholder="Reply..." className="mb-2" />
              <div className="d-flex gap-2">
                <Button size="sm" disabled={!reply.trim()||working} type="submit">{working? 'Posting...':'Submit'}</Button>
                <Button size="sm" variant="outline-secondary" onClick={()=> { setReplyOpen(false); setReply(''); }}>Cancel</Button>
              </div>
            </Form>
          </div>
        </Collapse>
      </div>
      <div className="ms-4 mt-2">
  {node.replies?.map(r=> <CommentItem key={r.id} node={r} postId={postId} />)}
      </div>
    </div>
  );
}
