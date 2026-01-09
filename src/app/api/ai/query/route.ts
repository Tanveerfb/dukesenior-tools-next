import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { getAIResponse as clientFallback } from '@/lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = (body?.prompt || '').toString();
    if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

    // Optional auth: if an idToken is provided in headers, verify and attach user info
    const idToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const user = idToken ? await verifyIdToken(idToken) : null;

    // Try to call server-side AI provider if available. If not, fall back to client mock.
    // Note: this keeps keys off the client. Add a proper provider call here (Vertex/OpenAI) for production.
    try {
      // Placeholder: try dynamic import of server AI libs if present (no-op otherwise)
      // For now, return the same mock used on client to keep behavior predictable.
      const text = await clientFallback(prompt);
      return NextResponse.json({ text, user: user || null });
    } catch (innerErr) {
      const text = await clientFallback(prompt);
      return NextResponse.json({ text, user: user || null });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
