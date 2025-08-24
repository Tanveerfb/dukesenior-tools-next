"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPostBySlug, addComment, reactToPostForUser, reactToCommentForUser, listenPost, listenComments, getUserPostReaction, getUserCommentReaction } from '@/lib/services/cms';
import { getSamplePostBySlug } from '@/lib/content/samplePosts';
import { Container, Badge, Spinner, Button, Form, Collapse } from 'react-bootstrap';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import { useAuth } from '@/hooks/useAuth';

interface CommentNode { id:string; content:string; authorName:string; createdAt:number; likeCount:number; dislikeCount:number; replies?: CommentNode[]; parentId?: string; userReaction?: 'like'|'dislike'; }

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
      return `\n<div class=\"ratio ratio-16x9 my-3\"><iframe src=\"https://player.twitch.tv/?channel=${c}&parent=${typeof window !== 'undefined'? window.location.hostname : 'localhost'}\" frameborder=\"0\" allowfullscreen=\"true\" scrolling=\"no\"></iframe></div>\n`;
    });
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

  useEffect(()=> {
    let unsubPost: undefined | (()=>void);
    let unsubComments: undefined | (()=>void);
    async function init(){
      setLoading(true);
      try {
        const base = await getPostBySlug(slug) || getSamplePostBySlug(slug);
        if(!base){ setPost(undefined); return; }
        setPost(base);
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

  async function submit(parentId?: string){ if(!user || !post) return; if(!newComment.trim()) return; setPosting(true); try { await addComment(user.uid, user.email||'unknown', { postId: post.id, parentId, content: newComment.trim() }); setNewComment(''); } finally { setPosting(false);} }

  function renderContent(md: string){ return transformEmbeds(md); }

  if(loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  if(!post) return <Container className="py-5"><div className="text-muted">Post not found.</div></Container>;

  return (
    <Container className="py-4 post-view">
      <div className="mb-3 d-flex flex-wrap gap-2">
        {post.tags?.map((t:string)=> <Badge key={t} bg="info">{t}</Badge>)}
        {post.pinned && <Badge bg="warning" text="dark">Pinned</Badge>}
        <div className="ms-auto small text-muted">{new Date(post.createdAt).toLocaleString()}</div>
      </div>
      <h1 className="mb-3">{post.title}</h1>
      {post.bannerUrl && (
        <div className="mb-4">
          <Image src={post.bannerUrl} alt={post.title} className="img-fluid rounded" width={1200} height={630} style={{height:'auto'}} />
        </div>
      )}
      <div className="markdown-body mb-5">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}>{renderContent(post.content)}</ReactMarkdown>
      </div>
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
