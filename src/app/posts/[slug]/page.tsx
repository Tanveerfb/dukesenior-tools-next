"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

// Helper: render comment content and turn @username into profile links
function renderCommentWithLinks(content: string){
  if(!content) return <>{''}</>;
  const parts: Array<string|React.ReactNode> = [];
  const re = /@([A-Za-z0-9_]{3,32})/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while((m = re.exec(content))){
    const idx = m.index;
    if(idx > lastIndex) parts.push(content.slice(lastIndex, idx));
    const uname = m[1];
    parts.push(<Link key={idx} href={`/profile/${encodeURIComponent(uname)}`} className="text-decoration-none">@{uname}</Link>);
    lastIndex = idx + m[0].length;
  }
  if(lastIndex < content.length) parts.push(content.slice(lastIndex));
  return <span style={{whiteSpace:'pre-wrap'}}>{parts.map((p, i) => typeof p === 'string' ? <span key={i}>{p}</span> : p)}</span>;
}
import { useParams, useSearchParams } from 'next/navigation';
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
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAuth } from 'firebase/auth';
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

// Extract @username tokens and call server API to create notifications
async function notifyMentions(text: string, postId: string, commentId?: string, postSlug?: string){
  // Notifications functionality removed - this is a no-op now
  return;
}

export default function PostView(){
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams?.();
  const debugRaw = !!(searchParams && searchParams.get('debugRaw') === '1');
  const [loading,setLoading] = useState(true);
  const [post,setPost] = useState<any>();
  const [comments,setComments] = useState<CommentNode[]>([]);
  const scrolledToHashRef = useRef(false);
  const [newComment,setNewComment] = useState('');
  const newCommentRef = useRef<HTMLTextAreaElement | null>(null);
  const [suggestions, setSuggestions] = useState<{username:string; uid:string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionOwner, setSuggestionOwner] = useState<string | null>(null); // 'main' or commentId
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionPartial, setMentionPartial] = useState<string>('');
  const suggestionTimerRef = useRef<number | null>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [posting,setPosting] = useState(false);
  const [userPostReaction,setUserPostReaction] = useState<'like'|'dislike'|undefined>();
  const { user } = useAuth();
  const [copied,setCopied] = useState(false);
  const [commentError, setCommentError] = useState<string|undefined>();
  // Sanitization schema to allow iframe elements for embeds
  // Sanitization schema to allow iframe elements for embeds and also
  // preserve standard markdown-generated tags (p, headings, lists, strong, em, img, code, blockquote).
  const sanitizeSchema = {
    tagNames: [
      'p','h1','h2','h3','h4','h5','h6','strong','em','b','i','ul','ol','li','pre','code','blockquote',
      'iframe','div','a','img','figure','figcaption','span','svg','path'
    ],
    attributes: {
      iframe: ['src','title','allow','frameborder','allowfullscreen','loading','scrolling'],
      div: ['class','className'],
      a: ['href','target','rel','class','className','aria-label'],
      img: ['src','alt','title','width','height'],
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
  // Dev debug: print a short snippet of the raw content so we can verify whether
  // the content contains escaped HTML entities or raw markdown/html.
  try{ if(process.env.NODE_ENV !== 'production') console.debug('[PostView] content preview:', (base.content||'').slice(0,400)); }catch(e){}
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

  // If navigated with a hash (e.g., /posts/:slug#comment-<id>) the comment element
  // may not exist when the route first renders because comments load async.
  // Keep trying to find and scroll to the element every 200ms for up to ~5s.
  useEffect(()=>{
    if(typeof window === 'undefined') return;
    const hash = window.location.hash;
    if(!hash) return;
    if(scrolledToHashRef.current) return;
    const id = decodeURIComponent(hash.replace('#',''));
    function tryScroll(){
      const el = document.getElementById(id);
      if(el){
        try{ el.scrollIntoView({ behavior: 'smooth', block: 'center' }); (el as HTMLElement).focus?.(); }catch(e){}
        scrolledToHashRef.current = true;
        return true;
      }
      return false;
    }
    // immediate attempt
    if(tryScroll()) return;
    let attempts = 0;
    const maxAttempts = 25; // ~5s at 200ms per attempt
    const iv = window.setInterval(()=>{
      attempts++;
      if(tryScroll() || attempts >= maxAttempts){
        window.clearInterval(iv);
      }
    }, 200);
    // also respond to future hash changes while on the page
    function onHash(){ if(!scrolledToHashRef.current) tryScroll(); }
    window.addEventListener('hashchange', onHash);
    return ()=>{ window.clearInterval(iv); window.removeEventListener('hashchange', onHash); };
  }, [slug, comments, post]);

  

  // keyboard navigation for lightbox
  useEffect(()=> {
    if(!lightboxOpen) return;
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape') { setLightboxOpen(false); }
      else if(e.key === 'ArrowLeft') { gotoPrev(); }
      else if(e.key === 'ArrowRight') { gotoNext(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, currentIndex, gallery, gotoPrev, gotoNext]);

  const readTime = estimateReadTime(post?.content || '');
  const headings = extractHeadings(post?.content || '');

  async function submit(parentId?: string){
    if(!user || !post) return;
    if(!newComment.trim()) return;
    setPosting(true);
    setCommentError(undefined);
    try {
  const content = newComment.trim();
  // extract mentions to persist on the comment
  const re = /@([A-Za-z0-9_]{3,32})/g; const set = new Set<string>(); let mm: RegExpExecArray | null; while((mm = re.exec(content))){ set.add(mm[1].toLowerCase()); }
  const mentions = Array.from(set);
  const commentId = await addComment(user.uid, user.email||'unknown', { postId: post.id, parentId, content, mentions });
  setNewComment('');
  setShowSuggestions(false);
  try { await notifyMentions(content, post.id, commentId, post.slug); } catch(e){ console.warn('mention notify failed', e); }
    } catch(err:any){
      console.error('Add comment failed', err);
      setCommentError('Failed to post comment: ' + (err?.message||'unknown'));
    } finally { setPosting(false); }
  }

  // --- mention autocomplete for main textarea ---
  const fetchSuggestions = useCallback(async (q: string, owner?: string)=>{
    // prefer server API (Admin-backed) when available
    try{
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
  if(res.ok){ const json = await res.json(); if(json?.results && Array.isArray(json.results) && json.results.length){ setSuggestions(json.results.slice(0,8)); setActiveSuggestion(0); setSuggestionOwner(owner || null); setShowSuggestions(true); return; } }
    }catch(e){ /* ignore */ }

    // fallback to client Firestore query
    try{
      const { db } = await import('@/lib/firebase/client');
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
      const start = q;
      const end = q + '\uf8ff';
      const col = collection(db, 'usernames');
      const qref = query(col, where('username','>=', start), where('username','<=', end), orderBy('username'), limit(8));
      const snap = await getDocs(qref as any);
      const out: {username:string; uid:string}[] = [];
      snap.forEach(d=> { const data = d.data() as any; if(data?.username && data?.uid) out.push({ username: data.username, uid: data.uid }); });
  if(out.length){ setSuggestions(out); setActiveSuggestion(0); setSuggestionOwner(owner || null); setShowSuggestions(true); return; }
    }catch(e){ /* ignore */ }

  // no results: clear owner
  setSuggestionOwner(null);
  setSuggestions([]); setShowSuggestions(false);
  }, []);

  function handleNewCommentChange(e: React.ChangeEvent<HTMLTextAreaElement>){
    const val = e.target.value;
    setNewComment(val);
    // detect mention token at caret
    const caret = e.target.selectionStart || val.length;
    const before = val.slice(0, caret);
    const at = before.lastIndexOf('@');
    if(at >= 0 && (at === 0 || /\s/.test(before[at-1]))){
      const partial = before.slice(at+1);
      setMentionPartial(partial);
      if(/^[A-Za-z0-9_]{1,32}$/.test(partial)){
        setMentionStart(at);
        if(suggestionTimerRef.current) window.clearTimeout(suggestionTimerRef.current);
  // mark owner as main textarea so only it shows suggestions
  suggestionTimerRef.current = window.setTimeout(()=> fetchSuggestions(partial.toLowerCase(), 'main'), 200) as unknown as number;
        return;
      }
    }
    // else hide
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionStart(null);
    setMentionPartial('');
  }

  function applySuggestionToTextarea(username: string){
  const ta = activeTextareaRef.current || newCommentRef.current;
    if(!ta) return;
    const val = newComment;
    const caret = ta.selectionStart || val.length;
    const start = mentionStart ?? val.lastIndexOf('@', caret-1);
    if(start < 0) return;
    const before = val.slice(0, start);
    const after = val.slice(caret);
    const insert = `@${username} `;
    const newVal = before + insert + after;
    setNewComment(newVal);
    setShowSuggestions(false);
  setSuggestionOwner(null);
    setSuggestions([]);
    setMentionStart(null);
    // position caret after inserted username
    requestAnimationFrame(()=>{ const pos = before.length + insert.length; try{ ta.focus(); ta.setSelectionRange(pos,pos); }catch(e){} });
  }

  function handleNewKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>){
    if(!showSuggestions || suggestions.length===0) return;
    if(e.key === 'ArrowDown'){
      e.preventDefault(); setActiveSuggestion(i => Math.min(suggestions.length-1, i+1));
    } else if(e.key === 'ArrowUp'){
      e.preventDefault(); setActiveSuggestion(i => Math.max(0, i-1));
    } else if(e.key === 'Enter'){
      // if suggestion open and caret at mention, accept
      e.preventDefault(); const s = suggestions[activeSuggestion]; if(s) applySuggestionToTextarea(s.username);
    } else if(e.key === 'Escape'){
      setShowSuggestions(false);
  setSuggestionOwner(null);
    }
  }
  // Some stored posts may have HTML entities escaped (e.g. &lt;iframe&gt;). Decode them
  // on the client before passing to ReactMarkdown so rehype-raw can parse actual tags.
  function decodeHtmlEntities(input: string){
    try{
      const t = document.createElement('textarea');
      t.innerHTML = input;
      return t.value;
    }catch(e){ return input; }
  }

  // Only decode HTML entities when the content actually contains entity markers
  // (e.g. &lt; or &gt;). Many posts are plain Markdown and decoding via a
  // DOM textarea can mutate sequences like backslashes/newlines; prefer to
  // leave plain Markdown untouched so remark-gfm parses as expected.
  function renderContent(md: string){
    if(!md) return '';
    const hasEntities = md.includes('&lt;') || md.includes('&gt;') || md.includes('&amp;') || md.includes('&quot;');
    const input = hasEntities ? decodeHtmlEntities(md) : md;
    return transformEmbeds(input);
  }
  const memoizedMarkdown = useMemo(() => renderContent(post?.content || ''), [post?.content]);

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
            {debugRaw && (
              <div className="mb-3">
                <strong>Debug: raw stored content preview</strong>
                <pre style={{maxHeight:160, overflow:'auto', background:'#f8f9fa', padding:8}}>{String(post.content || '').slice(0,1000)}</pre>
                <div className="mt-2">
                  <strong>Debug (JSON.stringify)</strong>
                  <pre style={{maxHeight:160, overflow:'auto', background:'#fff8db', padding:8}}>{JSON.stringify(post.content)}</pre>
                </div>
                <div className="mt-2">
                  <strong>Minimal render (remark-gfm only)</strong>
                  <div className="p-2 border rounded bg-body-tertiary" style={{maxHeight:220, overflow:'auto'}}>
                    {String(post.content || '').trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(post.content || '')}</ReactMarkdown> : <div className="text-muted small">(empty)</div>}
                  </div>
                </div>
              </div>
            )}
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
            >{memoizedMarkdown}</ReactMarkdown>
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
            <Form.Group className="mb-2" style={{ position: 'relative' }}>
              <Form.Control as="textarea" rows={3} value={newComment} onChange={handleNewCommentChange} onKeyDown={handleNewKeyDown} placeholder="Write a comment..." ref={(el:any) => newCommentRef.current = el} />
              {showSuggestions && suggestions.length > 0 && suggestionOwner === 'main' && (
                <div style={{ position: 'absolute', left: 8, right: 8, top: '100%', zIndex: 2000, background: 'var(--bs-body-bg)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 6, marginTop: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
                  {suggestions.map((s, idx)=> (
                    <div key={s.username} onMouseDown={(ev)=> { ev.preventDefault(); applySuggestionToTextarea(s.username); }} style={{ padding: '6px 10px', cursor: 'pointer', background: idx===activeSuggestion? 'rgba(0,0,0,0.06)': 'transparent' }}>
                      @{s.username}
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
            <div className="small text-muted mb-2">Mention partial: <strong>{mentionPartial || '-'}</strong> • Suggestions: {suggestions.length}</div>
            <Button size="sm" disabled={!newComment.trim()||posting} type="submit">{posting? 'Posting...':'Post Comment'}</Button>
          </Form>
        ) : <div className="text-muted small mb-3">Login to comment.</div>}
        {!post.id.startsWith('sample-') && (
          <div className="comments-tree">
            {comments.map(c => <CommentItem key={c.id} node={c} postId={post.id} mentionProps={{ suggestions, showSuggestions, suggestionOwner, activeSuggestion, applySuggestionToTextarea, fetchSuggestions, setActiveSuggestion, setShowSuggestions, setSuggestionOwner, setSuggestions, activeTextareaRef, postSlug: post.slug }} />)}
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

function CommentItem({ node, postId, mentionProps }: { node: CommentNode; postId: string; mentionProps?: any }){
  const { user } = useAuth();
  const { suggestions = [], showSuggestions = false, suggestionOwner = null, activeSuggestion = 0, applySuggestionToTextarea = (u:string)=>{}, fetchSuggestions = async (q:string)=>{}, setActiveSuggestion = (v:any)=>{}, setShowSuggestions = (v:any)=>{}, setSuggestionOwner = (v:any)=>{}, setSuggestions = (v:any)=>{}, activeTextareaRef = { current: null } } = mentionProps || {};
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
  async function submit(){
    if(!user || !reply.trim()) return;
    setWorking(true);
    try {
  const c = reply.trim();
  const re = /@([A-Za-z0-9_]{3,32})/g; const set = new Set<string>(); let mm: RegExpExecArray | null; while((mm = re.exec(c))){ set.add(mm[1].toLowerCase()); }
  const mentions = Array.from(set);
  const commentId = await addComment(user.uid, user.email||'unknown', { postId, parentId: node.id, content: c, mentions });
  setReply('');
  setReplyOpen(false);
  try { await notifyMentions(c, postId, commentId, mentionProps?.postSlug); } catch(e){ console.warn('mention notify failed', e); }
    } finally { setWorking(false);} 
  }

  // insert suggestion into this reply textarea (keeps local React state in sync)
  function insertSuggestionLocal(username: string){
    const ta = activeTextareaRef.current as HTMLTextAreaElement | null;
    // fallback: try to find focused textarea in this component
    const caret = ta ? (ta.selectionStart || ta.value.length) : reply.length;
    const val = reply;
    const start = (ta ? val.lastIndexOf('@', caret-1) : val.lastIndexOf('@', caret-1));
    if(start < 0) return;
    const before = val.slice(0, start);
    const after = val.slice(caret);
    const insert = `@${username} `;
    const newVal = before + insert + after;
    setReply(newVal);
    setShowSuggestions(false);
    setSuggestionOwner(null);
    setSuggestions([]);
    // restore focus and caret
    requestAnimationFrame(()=>{ try{ if(ta){ ta.focus(); const pos = before.length + insert.length; ta.setSelectionRange(pos,pos); } }catch(e){} });
  }
  return (
    <div id={`comment-${node.id}`} className="mb-3">
      <div className="p-2 border rounded bg-body-tertiary">
        <div className="d-flex align-items-center gap-2 small text-muted mb-1"><strong className="text-body">{node.authorName}</strong><span>{new Date(node.createdAt).toLocaleString()}</span></div>
  <div className="small mb-2">{renderCommentWithLinks(node.content)}</div>
        <div className="d-flex gap-2">
          <Button size="sm" variant={userReaction==='like'? 'success':'outline-success'} disabled={!user} onClick={()=> react('like')}>👍 {likeCount}</Button>
          <Button size="sm" variant={userReaction==='dislike'? 'danger':'outline-danger'} disabled={!user} onClick={()=> react('dislike')}>👎 {dislikeCount}</Button>
          {user && <Button size="sm" variant="outline-primary" onClick={()=> setReplyOpen(o=> !o)}>Reply</Button>}
        </div>
        <Collapse in={replyOpen}>
          <div>
            <Form className="mt-2" onSubmit={e=> { e.preventDefault(); submit(); }}>
      <Form.Control as="textarea" rows={2} value={reply} onChange={e=> { setReply(e.target.value);
        // reply mention handling: set active textarea and look for @
        const ta = e.target as HTMLTextAreaElement; activeTextareaRef.current = ta; const caret = ta.selectionStart || ta.value.length; const before = ta.value.slice(0, caret); const at = before.lastIndexOf('@'); if(at >= 0 && (at===0 || /\s/.test(before[at-1]))){ const partial = before.slice(at+1); if(/^[A-Za-z0-9_]{1,32}$/.test(partial)){ // debounce: simple 200ms
        // mark this comment as suggestion owner so only its dropdown shows
        setSuggestionOwner(node.id);
        setTimeout(()=> fetchSuggestions(partial.toLowerCase(), node.id), 200);
          } }
        }} placeholder="Reply..." className="mb-2" onFocus={(e)=> { activeTextareaRef.current = e.target as HTMLTextAreaElement; setSuggestionOwner(node.id); }} onBlur={(e)=> { /* keep suggestions visible briefly; they will be cleared on apply or escape */ }} onKeyDown={(e)=> { if(suggestionOwner === node.id && showSuggestions) { if(e.key === 'ArrowDown'){ e.preventDefault(); setActiveSuggestion((i:number)=> Math.min(suggestions.length-1, i+1)); } else if(e.key === 'ArrowUp'){ e.preventDefault(); setActiveSuggestion((i:number)=> Math.max(0, i-1)); } else if(e.key === 'Enter'){ e.preventDefault(); const s = suggestions[activeSuggestion]; if(s) insertSuggestionLocal(s.username); } else if(e.key === 'Escape'){ setShowSuggestions(false); setSuggestionOwner(null); } } }} />
              {suggestionOwner === node.id && showSuggestions && suggestions.length>0 && (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 8, right: 8, top: '100%', zIndex: 2000, background: 'var(--bs-body-bg)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 6, marginTop: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}>
                    {suggestions.map((s: {username:string; uid:string}, idx: number)=> (
                        <div key={s.username} onMouseDown={(ev)=> { ev.preventDefault(); // ensure owner still this before applying
                          if(suggestionOwner === node.id) insertSuggestionLocal(s.username);
                        }} style={{ padding: '6px 10px', cursor: 'pointer', background: idx===activeSuggestion? 'rgba(0,0,0,0.06)': 'transparent' }}>
                          @{s.username}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              <div className="d-flex gap-2">
                <Button size="sm" disabled={!reply.trim()||working} type="submit">{working? 'Posting...':'Submit'}</Button>
                <Button size="sm" variant="outline-secondary" onClick={()=> { setReplyOpen(false); setReply(''); }}>Cancel</Button>
              </div>
            </Form>
          </div>
        </Collapse>
      </div>
      <div className="ms-4 mt-2">
  {node.replies?.map(r=> <CommentItem key={r.id} node={r} postId={postId} mentionProps={mentionProps} />)}
      </div>
    </div>
  );
}
