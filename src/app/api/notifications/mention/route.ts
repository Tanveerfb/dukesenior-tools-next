import { NextResponse } from 'next/server';
import { verifyIdToken, adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// POST { usernames: string[], postId: string, commentId?: string, context?: string }
export async function POST(req: Request){
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s*/i, '');
  const v = await verifyIdToken(token);
  if(!v) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if(!adminDb) return NextResponse.json({ error: 'admin_uninitialized' }, { status: 503 });

  const body = await req.json().catch(()=> ({}));
  const usernames: string[] = Array.isArray(body?.usernames) ? body.usernames : [];
  const postId: string = typeof body?.postId === 'string' ? body.postId : '';
  const postSlug: string = typeof body?.postSlug === 'string' ? body.postSlug : '';
  const context: string = typeof body?.context === 'string' ? body.context : '';
  const commentId: string = typeof body?.commentId === 'string' ? body.commentId : '';
  if(!usernames.length || !postId) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });

  const batch = adminDb.batch();
  const results: { username: string; created: boolean; uid?: string }[] = [];
  for(const raw of usernames){
    const uname = (raw || '').trim().toLowerCase();
    if(!uname) continue;
  const mapRef = adminDb.collection('usernames').doc(uname);
  const snap = await mapRef.get();
    if(!snap.exists) { results.push({ username: uname, created: false }); continue; }
    const data = snap.data() as any;
    const mentionedUid = data?.uid as string | undefined;
    if(!mentionedUid) { results.push({ username: uname, created: false }); continue; }

  const notifRef = adminDb.collection(`notifications_${mentionedUid}`).doc();
    // Using a collection per user to keep reads simple; doc shape:
    // { id, fromUid, fromUsername, postId, context, createdAt, read }
  const base = { fromUid: v.uid, fromUsername: v.name || v.email || '', postId, postSlug: postSlug || null, commentId: commentId || null, context, createdAt: Timestamp.now(), read: false };
  batch.set(notifRef as any, base);
    results.push({ username: uname, created: true, uid: mentionedUid });
  }

  try {
    await batch.commit();
  } catch (e){
    return NextResponse.json({ error: 'batch_failed', details: String(e) }, { status: 500 });
  }

  return NextResponse.json({ ok: true, results });
}
