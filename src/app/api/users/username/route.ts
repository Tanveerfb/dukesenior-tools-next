import { NextResponse } from 'next/server';
import { verifyIdToken, adminAuth } from '@/lib/firebase/admin';
import { setUsername } from '@/lib/services/users';

export async function POST(req: Request){
  try{
    const body = await req.json();
    const { username } = body || {};
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if(!token) return NextResponse.json({ error: 'no_token' }, { status: 401 });
  // If adminAuth failed to initialize (local dev missing service account), return helpful error
  if (!adminAuth) return NextResponse.json({ error: 'admin_uninitialized', message: 'Firebase Admin SDK not initialized (set GOOGLE_APPLICATION_CREDENTIALS).' }, { status: 503 });
  const decoded = await verifyIdToken(token);
  if(!decoded) return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    const uid = decoded.uid as string;
    try{
      await setUsername(uid, username);
      return NextResponse.json({ ok: true });
    } catch (err:any){
        return NextResponse.json({ error: err.message || 'failed' }, { status: 400 });
      }
  }catch(e){
      return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
