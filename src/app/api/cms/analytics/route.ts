import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/server/auth';
import { getAnalyticsSummary } from '@/lib/services/cms';
import { apiError, apiOk } from '@/lib/utils/api';

export async function GET(req: NextRequest) {
  const auth = await verifyIdToken(req.headers.get('authorization')?.replace('Bearer ', ''));
  if (!auth) return apiError('unauthorized', 401);

  try {
    const analytics = await getAnalyticsSummary();
    return apiOk(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return apiError(error?.message || 'Failed to fetch analytics', 500);
  }
}
