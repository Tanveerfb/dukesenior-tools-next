import { NextResponse } from 'next/server';
import { verifyIdToken, adminAuth } from '@/lib/firebase/admin';
import { setUsername } from '@/lib/services/users';
import { apiError } from '@/lib/utils/api';

export async function POST(req: Request){
  try{
    const body = await req.json();
    const { username } = body || {};
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if(!token) return apiError('no_token', 401);
    if (!adminAuth) return apiError('admin_uninitialized', 503);
    const decoded = await verifyIdToken(token);
    if(!decoded) return apiError('invalid_token', 401);
    const uid = decoded.uid as string;
    try{
      await setUsername(uid, username);
      return NextResponse.json({ ok: true });
    } catch (err:any){
      return apiError(err.message || 'failed', 400);
    }
  }catch(_e){
    return apiError('internal', 500);
  }
}
