import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/server/auth';
import { awardAchievement } from '@/lib/services/gamification';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verifiedUser = await verifyIdToken(token);

    if (!verifiedUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { uid, achievementId } = body;

    if (!uid || !achievementId) {
      return NextResponse.json(
        { error: 'User ID and achievement ID are required' },
        { status: 400 }
      );
    }

    // Award the achievement
    const success = await awardAchievement(uid, achievementId, verifiedUser.uid);

    if (!success) {
      return NextResponse.json(
        { error: 'Achievement already unlocked or user not found' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return NextResponse.json(
      { error: 'Failed to award achievement' },
      { status: 500 }
    );
  }
}
