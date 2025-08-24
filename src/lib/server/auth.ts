import { headers } from 'next/headers';
import { verifyIdToken as _verifyIdToken } from '@/lib/firebase/admin';

// Mirror client-side admin logic
const ADMIN_EMAILS = new Set([
  'dukesenior22@proton.me',
  'flareon@abv.bg'
]);
const ADMIN_UIDS = new Set([
  'GeLWvzA1PxfvGBmvN1niZ2GjHKe2'
]);

export interface AdminAuthResult { admin: boolean; uid?: string; email?: string; tokenValid: boolean; }

export async function verifyAdminFromRequest(): Promise<AdminAuthResult>{
  try {
    const h = await headers();
    const auth = h.get('authorization') || h.get('Authorization');
    if(!auth || !auth.startsWith('Bearer ')) return { admin:false, tokenValid:false };
    const token = auth.substring(7);
  const decoded = await _verifyIdToken(token);
    if(!decoded) return { admin:false, tokenValid:false };
    const email = decoded.email || '';
    const uid = decoded.uid;
    const admin = ADMIN_EMAILS.has(email) || ADMIN_UIDS.has(uid) || !!(decoded as any).admin;
    return { admin, uid, email, tokenValid:true };
  } catch { return { admin:false, tokenValid:false }; }
}

// Lightweight re-export for API routes needing only token validation (non-admin specific)
export async function verifyIdToken(token?: string){
  return _verifyIdToken(token);
}