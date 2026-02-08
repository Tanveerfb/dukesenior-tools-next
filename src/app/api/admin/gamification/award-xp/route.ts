import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/server/auth';
import { awardXP } from '@/lib/services/gamification';

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
    const { uid, amount, reason } = body;

    if (!uid || !amount || amount <= 0 || !reason) {
      return NextResponse.json(
        { error: 'User ID, positive XP amount, and reason are required' },
        { status: 400 }
      );
    }

    // Award the XP
    const result = await awardXP(uid, amount, reason, 'manual', {
      awardedBy: verifiedUser.uid,
      manual: true,
    });

    return NextResponse.json({
      success: true,
      newXP: result.newXP,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
