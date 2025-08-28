import { NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase/admin';

// GET /api/admin/suggestions?limit=25&cursor=123456789&category=homepage&responded=all&archived=false
export async function GET(req: Request) {
  if (!adminDb) return NextResponse.json({ error: 'admin_db_unavailable' }, { status: 503 });

  // verify id token from Authorization header (Bearer)
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const verified = await verifyIdToken(token);
  if (!verified) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '25', 10) || 25, 200);
  const cursor = url.searchParams.get('cursor');
  const category = url.searchParams.get('category');
  const responded = url.searchParams.get('responded'); // 'all' | 'responded' | 'unresponded'
  const archived = url.searchParams.get('archived'); // 'true' | 'false' | undefined

  try {
    let q: any = adminDb.collection('admin').doc('support').collection('suggestions').orderBy('createdAt', 'desc');
    if (category) q = q.where('category', '==', category);
    if (responded === 'responded') q = q.where('response', '!=', null);
    if (responded === 'unresponded') q = q.where('response', '==', null);
    if (archived === 'true') q = q.where('archived', '==', true);
    if (archived === 'false') q = q.where('archived', '==', false);

    if (cursor) {
      const curNum = Number(cursor);
      if (!Number.isNaN(curNum)) {
        const snaps = await adminDb.collection('admin').doc('support').collection('suggestions').where('createdAt', '<', curNum).orderBy('createdAt', 'desc').limit(limit).get();
        const out: any[] = [];
        snaps.forEach((s: any) => out.push(s.data()));
        const nextCursor = out.length ? out[out.length - 1].createdAt : null;
        return NextResponse.json({ results: out, nextCursor });
      }
    }

  const snaps = await q.limit(limit).get();
  const out: any[] = [];
  snaps.forEach((s: any) => out.push(s.data()));
    const nextCursor = out.length ? out[out.length - 1].createdAt : null;
    return NextResponse.json({ results: out, nextCursor });
  } catch (err) {
    console.error('admin suggestions query error', err);
    return NextResponse.json({ error: 'query_failed' }, { status: 500 });
  }
}
