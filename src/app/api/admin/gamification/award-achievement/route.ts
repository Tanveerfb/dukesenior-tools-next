import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/server/auth';
import { awardAchievement } from '@/lib/services/gamification';
import { apiError, apiOk } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiError('Unauthorized', 401);
    }

    const verifiedUser = await verifyIdToken(authHeader.substring(7));
    if (!verifiedUser) return apiError('Unauthorized', 401);

    const { uid, achievementId } = await request.json();
    if (!uid || !achievementId) {
      return apiError('User ID and achievement ID are required', 400);
    }

    const success = await awardAchievement(uid, achievementId, verifiedUser.uid);
    if (!success) return apiError('Achievement already unlocked or user not found', 400);

    return apiOk({ success: true });
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return apiError('Failed to award achievement', 500);
  }
}
