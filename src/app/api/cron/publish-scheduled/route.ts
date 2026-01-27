import { NextRequest, NextResponse } from 'next/server';
import { listScheduledPosts, publishScheduledPost } from '@/lib/services/cms';

// This endpoint is called by Vercel Cron to publish scheduled posts
// Vercel Cron authentication is handled via the authorization header with a secret
export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all scheduled posts that should be published now
    const scheduledPosts = await listScheduledPosts();
    
    const published: string[] = [];
    for (const post of scheduledPosts) {
      await publishScheduledPost(post.id);
      published.push(post.id);
    }

    return NextResponse.json({ 
      success: true, 
      published: published.length,
      postIds: published 
    });
  } catch (error: any) {
    console.error('Error publishing scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to publish posts', message: error?.message },
      { status: 500 }
    );
  }
}
