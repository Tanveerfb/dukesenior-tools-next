import { verifyIdToken } from '@/lib/firebase/admin';
import { getAIResponse as clientFallback } from '@/lib/ai/gemini';
import { apiError, apiOk } from '@/lib/utils/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = (body?.prompt || '').toString();
    if (!prompt) return apiError('Missing prompt', 400);

    const idToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const user = idToken ? await verifyIdToken(idToken) : null;

    try {
      const text = await clientFallback(prompt);
      return apiOk({ text, user: user || null });
    } catch (_innerErr) {
      const text = await clientFallback(prompt);
      return apiOk({ text, user: user || null });
    }
  } catch (_err) {
    return apiError('Invalid request', 400);
  }
}
