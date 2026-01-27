import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/server/auth';
import { getAnalyticsSummary } from '@/lib/services/cms';

export async function GET(req: NextRequest) {
  const auth = await verifyIdToken(req.headers.get('authorization')?.replace('Bearer ', ''));
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Check if user is admin (you may want to add admin check here)
  // For now, any authenticated user can access analytics
  
  try {
    const analytics = await getAnalyticsSummary();
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', message: error?.message },
      { status: 500 }
    );
  }
}
