import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/server/auth';
import { awardXP } from '@/lib/services/gamification';
import { apiError, apiOk } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiError('Unauthorized', 401);
    }

    const verifiedUser = await verifyIdToken(authHeader.substring(7));
    if (!verifiedUser) return apiError('Unauthorized', 401);

    const { uid, amount, reason } = await request.json();
    if (!uid || !amount || amount <= 0 || !reason) {
      return apiError('User ID, positive XP amount, and reason are required', 400);
    }

    const result = await awardXP(uid, amount, reason, 'manual', {
      awardedBy: verifiedUser.uid,
      manual: true,
    });

    return apiOk({
      success: true,
      newXP: result.newXP,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    return apiError('Failed to award XP', 500);
  }
}
