import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase/admin';
import { apiError } from '@/lib/utils/api';

// Very small in-memory rate limiter: map ip -> { count, firstTs }
const rateMap = new Map<string, { count: number; firstTs: number }>();
const WINDOW_MS = 60_000; // 1 minute
const LIMIT = 30; // allow 30 requests per IP per minute

function checkRate(ip: string) {
  const now = Date.now();
  const rec = rateMap.get(ip);
  if (!rec) {
    rateMap.set(ip, { count: 1, firstTs: now });
    return true;
  }
  if (now - rec.firstTs > WINDOW_MS) {
    rateMap.set(ip, { count: 1, firstTs: now });
    return true;
  }
  if (rec.count >= LIMIT) return false;
  rec.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  // NextRequest doesn't expose a standard `ip` property — rely on X-Forwarded-For if present.
  const xff = req.headers.get('x-forwarded-for');
  const ip = xff ? xff.split(',')[0].trim() : 'unknown';
  if (!checkRate(ip)) return apiError('rate_limited', 429);

  let body: any;
  try {
    body = await req.json();
  } catch (_err) {
    return apiError('invalid_json', 400);
  }

  const { category = 'homepage', message, anonymous = true, idToken } = body || {};
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return apiError('missing_message', 400);
  }

  // Try to verify token (may be undefined). If verified, we'll get uid/email.
  const verified = await verifyIdToken(idToken?.toString());
  const user = verified ? { uid: verified.uid, email: verified.email } : null;

  // If adminDb is available (service account), prefer server-side writes for reliability
  if (adminDb) {
    try {
      const id = Date.now().toString();
      const ts = Date.now();
      const adminRef = adminDb.collection('admin').doc('support').collection('suggestions').doc(id);
      const payload: any = { id, category, message: message.trim(), anonymous: !!anonymous, createdAt: ts };
      if (user && user.email && !anonymous) payload.email = user.email;
      if (user && user.uid && !anonymous) payload.uid = user.uid;
      await adminRef.set(payload);

      if (user && user.email) {
        const userRef = adminDb.collection('users').doc(user.email).collection('suggestions').doc(id);
        const userPayload = { ...payload };
        if (anonymous) { delete userPayload.email; delete userPayload.uid; }
        await userRef.set(userPayload);
      }

      return NextResponse.json({ ok: true, id });
    } catch (err) {
      console.error('admin write failed', err);
      // fallthrough to client SDK path
    }
  }

  // If adminDb not available, return 503 so client can fall back to client-side write path
  return apiError('server_unavailable', 503);
}
