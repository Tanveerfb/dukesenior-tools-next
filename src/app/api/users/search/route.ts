import { adminDb } from '@/lib/firebase/admin';
import { apiError, apiOk } from '@/lib/utils/api';

// GET /api/users/search?q=prefix
export async function GET(req: Request){
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  if(!q) return apiOk({ results: [] });
  if(!adminDb) return apiError('admin_uninitialized', 503);

  try {
    // Prefix range query: username >= q && username <= q + ''
    const start = q;
    const end = q + '';
    const col = adminDb.collection('usernames');
    const snap = await col.where('username', '>=', start).where('username', '<=', end).orderBy('username').limit(10).get();
    const results: { username: string; uid: string }[] = [];
    snap.forEach((d: any)=> { const data = d.data() as any; if(data?.username && data?.uid) results.push({ username: data.username, uid: data.uid }); });
    return apiOk({ results });
  } catch (err){
    return apiError(`query_failed: ${String(err)}`, 500);
  }
}
