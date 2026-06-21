import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/server/auth';
import { createPost, listPosts } from '@/lib/services/cms';
import { apiError, apiOk } from '@/lib/utils/api';

export async function GET(){
  const posts = await listPosts(50);
  return apiOk(posts);
}

export async function POST(req: NextRequest){
  const auth = await verifyIdToken(req.headers.get('authorization')?.replace('Bearer ',''));
  if(!auth) return apiError('unauthorized', 401);
  const body = await req.json();
  const id = await createPost(auth.uid, auth.email || 'unknown', body);
  return apiOk({ id });
}
