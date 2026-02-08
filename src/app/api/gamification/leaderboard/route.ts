import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/services/gamification';
import type { LeaderboardFilter, LeaderboardSort, LeaderboardPeriod } from '@/types/gamification';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const sort = (searchParams.get('sort') || 'xp') as LeaderboardSort;
    const period = (searchParams.get('period') || 'all-time') as LeaderboardPeriod;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const filter: LeaderboardFilter = {
      sort,
      period,
      limit,
    };

    const leaderboard = await getLeaderboard(filter);

    return NextResponse.json({ leaderboard, filter });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
