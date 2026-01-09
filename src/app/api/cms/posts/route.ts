import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/server/auth';
import { createPost, listPosts } from '@/lib/services/cms';

export async function GET(){
  const posts = await listPosts(50);
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest){
  const auth = await verifyIdToken(req.headers.get('authorization')?.replace('Bearer ',''));
  if(!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = await createPost(auth.uid, auth.email || 'unknown', body);
  return NextResponse.json({ id });
}
