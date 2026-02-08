import { NextRequest, NextResponse } from 'next/server';
import { getUserGamification, getUserRank } from '@/lib/services/gamification';

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const [gamification, rank] = await Promise.all([
      getUserGamification(uid),
      getUserRank(uid),
    ]);

    if (!gamification) {
      return NextResponse.json(
        { error: 'User gamification data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gamification,
      rank,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
