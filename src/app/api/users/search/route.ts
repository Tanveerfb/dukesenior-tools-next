import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// GET /api/users/search?q=prefix
export async function GET(req: Request){
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  if(!q) return NextResponse.json({ results: [] });
  if(!adminDb) return NextResponse.json({ error: 'admin_uninitialized' }, { status: 503 });

  try {
    // Prefix range query: username >= q && username <= q + '\uffff'
    const start = q;
    const end = q + '\uf8ff';
  const col = adminDb.collection('usernames');
  // Admin SDK doesn't support the unicode range trick the same way—use where >= start and <= end
  const snap = await col.where('username', '>=', start).where('username', '<=', end).orderBy('username').limit(10).get();
  const results: { username: string; uid: string }[] = [];
  snap.forEach((d: any)=> { const data = d.data() as any; if(data?.username && data?.uid) results.push({ username: data.username, uid: data.uid }); });
    return NextResponse.json({ results });
  } catch (err){
    return NextResponse.json({ error: 'query_failed', details: String(err) }, { status: 500 });
  }
}
