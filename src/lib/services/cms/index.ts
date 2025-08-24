import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, deleteDoc, where, increment, updateDoc, limit, onSnapshot, runTransaction } from 'firebase/firestore';
import { getAllSamplePosts } from '@/lib/content/samplePosts';
import { CMSPost, NewPostInput, UpdatePostInput, CMSComment, NewCommentInput } from '@/types/cms';

const POSTS_COL = 'cms_posts_v1';
const COMMENTS_COL = 'cms_comments_v1';
const POST_REACTIONS_COL = 'cms_post_reactions_v1';
const COMMENT_REACTIONS_COL = 'cms_comment_reactions_v1';

export async function createPost(uid: string, authorName: string, input: NewPostInput): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const ref = doc(db, POSTS_COL, id);
  const post: CMSPost = { id, title: input.title, slug: slugify(input.title), content: input.content, createdAt: now, updatedAt: now, authorUID: uid, authorName, bannerUrl: input.bannerUrl, tags: input.tags||[], pinned: !!input.pinned, likeCount:0, dislikeCount:0, commentCount:0 };
  await setDoc(ref, post);
  return id;
}

export async function updatePost(input: UpdatePostInput) {
  const ref = doc(db, POSTS_COL, input.id);
  await updateDoc(ref, { ...input, updatedAt: Date.now() });
}

export async function setPostPinned(id: string, pinned: boolean){
  await updateDoc(doc(db, POSTS_COL, id), { pinned, updatedAt: Date.now() });
}

export async function deletePost(id: string){ await deleteDoc(doc(db, POSTS_COL, id)); }

export async function listPosts(limitCount=25){
  const q = query(collection(db, POSTS_COL), orderBy('pinned','desc'), orderBy('createdAt','desc'), limit(limitCount));
  const snap = await getDocs(q); const list: CMSPost[] = []; snap.forEach(d=> list.push(d.data() as CMSPost)); return list;
}
export async function getPost(id: string){ const snap = await getDoc(doc(db, POSTS_COL, id)); return snap.data() as CMSPost | undefined; }
export async function getPostBySlug(slug: string){
  const q = query(collection(db, POSTS_COL), where('slug','==', slug), limit(1));
  const snap = await getDocs(q); let post: CMSPost | undefined; snap.forEach(d=> post = d.data() as CMSPost); return post;
}

// Comments
export async function addComment(uid: string, authorName: string, input: NewCommentInput){
  const id = crypto.randomUUID();
  const now = Date.now();
  let path = id;
  if(input.parentId){
    const parent = await getDoc(doc(db, COMMENTS_COL, input.parentId));
    const parentData = parent.data() as CMSComment | undefined;
    path = parentData ? parentData.path + '/' + id : id;
  }
  const comment: CMSComment = { id, postId: input.postId, parentId: input.parentId, authorUID: uid, authorName, content: input.content, createdAt: now, updatedAt: now, likeCount:0, dislikeCount:0, path };
  await setDoc(doc(db, COMMENTS_COL, id), comment);
  await updateDoc(doc(db, POSTS_COL, input.postId), { commentCount: increment(1) });
  return id;
}

export async function listTopLevelComments(postId: string){
  const q = query(collection(db, COMMENTS_COL), where('postId','==', postId), where('parentId','==', null));
  const snap = await getDocs(q); const list: CMSComment[] = []; snap.forEach(d=> list.push(d.data() as CMSComment)); return list;
}

export async function listReplies(parentId: string){
  const parentSnap = await getDoc(doc(db, COMMENTS_COL, parentId));
  const parent = parentSnap.data() as CMSComment | undefined; if(!parent) return [];
  const q = query(collection(db, COMMENTS_COL), where('path','>=', parent.path + '/'), where('path','<=', parent.path + '\uf8ff'));
  const snap = await getDocs(q); const list: CMSComment[] = []; snap.forEach(d=> { const c = d.data() as CMSComment; if(c.parentId===parentId) list.push(c); }); return list;
}

export async function listRecentComments(limitCount=50){
  const q = query(collection(db, COMMENTS_COL), orderBy('createdAt','desc'), limit(limitCount));
  const snap = await getDocs(q); const list: CMSComment[] = []; snap.forEach(d=> list.push(d.data() as CMSComment)); return list;
}

export async function deleteComment(id: string){
  const cSnap = await getDoc(doc(db, COMMENTS_COL, id));
  const data = cSnap.data() as CMSComment | undefined; if(!data) return;
  await deleteDoc(doc(db, COMMENTS_COL, id));
  // decrement post comment count (not counting nested separately for simplicity) 
  await updateDoc(doc(db, POSTS_COL, data.postId), { commentCount: increment(-1) });
}

export async function reactToComment(id: string, type: 'like' | 'dislike', delta=1){
  const field = type === 'like' ? 'likeCount' : 'dislikeCount';
  await updateDoc(doc(db, COMMENTS_COL, id), { [field]: increment(delta) });
}

export async function reactToPost(id: string, type: 'like' | 'dislike', delta=1){
  const field = type === 'like' ? 'likeCount' : 'dislikeCount';
  await updateDoc(doc(db, POSTS_COL, id), { [field]: increment(delta) });
}

// Realtime listeners
export function listenPost(id: string, cb: (post: CMSPost | undefined)=> void){
  return onSnapshot(doc(db, POSTS_COL, id), snap => cb(snap.data() as CMSPost | undefined));
}

export function listenComments(postId: string, cb: (comments: CMSComment[])=> void){
  const q = query(collection(db, COMMENTS_COL), where('postId','==', postId), orderBy('createdAt','asc'));
  return onSnapshot(q, snap => {
    const list: CMSComment[] = []; snap.forEach(d=> list.push(d.data() as CMSComment)); cb(list);
  });
}

// User-scoped reaction with transaction to prevent double count (client-side best effort)
export async function reactToPostForUser(postId: string, uid: string, reaction: 'like'|'dislike'){
  const reactionId = postId + '_' + uid;
  const reactionRef = doc(db, POST_REACTIONS_COL, reactionId);
  const postRef = doc(db, POSTS_COL, postId);
  await runTransaction(db, async (tx)=>{
    const reactionSnap = await tx.get(reactionRef);
    const prev = reactionSnap.exists()? (reactionSnap.data() as any).reaction : null;
    if(prev === reaction) return; // no change
    // adjust counts
    const incLike = (reaction==='like'? 1:0) - (prev==='like'?1:0);
    const incDislike = (reaction==='dislike'? 1:0) - (prev==='dislike'?1:0);
    if(!reactionSnap.exists()) tx.set(reactionRef, { postId, uid, reaction, createdAt: Date.now(), updatedAt: Date.now() });
    else tx.update(reactionRef, { reaction, updatedAt: Date.now() });
    tx.update(postRef, { likeCount: increment(incLike), dislikeCount: increment(incDislike) });
  });
}

export async function reactToCommentForUser(commentId: string, uid: string, reaction: 'like'|'dislike'){
  const reactionId = commentId + '_' + uid;
  const reactionRef = doc(db, COMMENT_REACTIONS_COL, reactionId);
  const commentRef = doc(db, COMMENTS_COL, commentId);
  await runTransaction(db, async (tx)=>{
    const reactionSnap = await tx.get(reactionRef);
    const prev = reactionSnap.exists()? (reactionSnap.data() as any).reaction : null;
    if(prev === reaction) return;
    const incLike = (reaction==='like'? 1:0) - (prev==='like'?1:0);
    const incDislike = (reaction==='dislike'? 1:0) - (prev==='dislike'?1:0);
    if(!reactionSnap.exists()) tx.set(reactionRef, { commentId, uid, reaction, createdAt: Date.now(), updatedAt: Date.now() });
    else tx.update(reactionRef, { reaction, updatedAt: Date.now() });
    tx.update(commentRef, { likeCount: increment(incLike), dislikeCount: increment(incDislike) });
  });
}

export async function getUserPostReaction(postId: string, uid: string){
  const snap = await getDoc(doc(db, POST_REACTIONS_COL, postId + '_' + uid));
  return snap.exists()? (snap.data() as any).reaction as 'like'|'dislike' : undefined;
}
export async function getUserCommentReaction(commentId: string, uid: string){
  const snap = await getDoc(doc(db, COMMENT_REACTIONS_COL, commentId + '_' + uid));
  return snap.exists()? (snap.data() as any).reaction as 'like'|'dislike' : undefined;
}

// Seed utilities
export async function seedSamplePostsIfEmpty(){
  const existing = await listPosts(1);
  if(existing.length) return false;
  const samples = getAllSamplePosts();
  for(const s of samples){
    const ref = doc(db, POSTS_COL, s.id);
    await setDoc(ref, s, { merge: false });
  }
  return true;
}

export async function seedSingleSamplePost(slug: string){
  const samples = getAllSamplePosts();
  const target = samples.find(p=> p.slug===slug);
  if(!target) return false;
  const ref = doc(db, POSTS_COL, target.id);
  const snap = await getDoc(ref);
  if(snap.exists()) return false; // already seeded
  await setDoc(ref, target, { merge: false });
  return true;
}

function slugify(t: string){ return t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').slice(0,80); }
