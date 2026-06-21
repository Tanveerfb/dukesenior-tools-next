import { NextRequest } from 'next/server';
import { listScheduledPosts, publishScheduledPost } from '@/lib/services/cms';
import { apiError, apiOk } from '@/lib/utils/api';

// This endpoint is called by Vercel Cron to publish scheduled posts
// Vercel Cron authentication is handled via the authorization header with a secret
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return apiError('Unauthorized', 401);
  }

  try {
    const scheduledPosts = await listScheduledPosts();

    const published: string[] = [];
    for (const post of scheduledPosts) {
      await publishScheduledPost(post.id);
      published.push(post.id);
    }

    return apiOk({ success: true, published: published.length, postIds: published });
  } catch (error: any) {
    console.error('Error publishing scheduled posts:', error);
    return apiError(error?.message || 'Failed to publish posts', 500);
  }
}
