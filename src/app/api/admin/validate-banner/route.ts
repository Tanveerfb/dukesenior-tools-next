import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';

export async function POST(req: Request){
  try{
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/, '');
    const user = await verifyIdToken(token || undefined);
    if(!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });
    const { url } = await req.json();
    if(!url) return NextResponse.json({ ok:false, error:'missing url' }, { status:400 });
    // perform a HEAD fetch to check content-type and length
    const res = await fetch(url, { method: 'HEAD' });
    if(!res.ok) return NextResponse.json({ ok:false, error:`remote returned ${res.status}` }, { status:400 });
    const ct = res.headers.get('content-type') || '';
    const cl = res.headers.get('content-length');
    const size = cl? parseInt(cl,10): null;
    // allow common image content types, max 10MB
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'];
    if(!allowed.some(a=> ct.includes(a))) return NextResponse.json({ ok:false, error:'unsupported content-type', contentType: ct }, { status:400 });
    if(size !== null && size > 10 * 1024 * 1024) return NextResponse.json({ ok:false, error:'file too large', size }, { status:400 });
    return NextResponse.json({ ok:true, contentType: ct, size });
  }catch(err:any){
    return NextResponse.json({ ok:false, error: err?.message || String(err) }, { status:500 });
  }
}
