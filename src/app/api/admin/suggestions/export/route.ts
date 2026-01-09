import { NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase/admin';

// GET /api/admin/suggestions/export?category=&responded=all&archived=false
export async function GET(req: Request) {
  if (!adminDb) return NextResponse.json({ error: 'admin_db_unavailable' }, { status: 503 });

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const verified = await verifyIdToken(token);
  if (!verified) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const responded = url.searchParams.get('responded');
    const archived = url.searchParams.get('archived');

    let q: any = adminDb.collection('admin').doc('support').collection('suggestions').orderBy('createdAt', 'desc');
    if (category) q = q.where('category', '==', category);
    if (responded === 'responded') q = q.where('response', '!=', null);
    if (responded === 'unresponded') q = q.where('response', '==', null);
    if (archived === 'true') q = q.where('archived', '==', true);
    if (archived === 'false') q = q.where('archived', '==', false);

    const snaps = await q.get();
    const out: any[] = [];
    snaps.forEach((s: any) => out.push(s.data()));
    return NextResponse.json({ results: out });
  } catch (err) {
    console.error('export suggestions error', err);
    return NextResponse.json({ error: 'export_failed' }, { status: 500 });
  }
}
