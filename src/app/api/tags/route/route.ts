import { NextRequest } from 'next/server';
import { getEffectiveRouteMeta, upsertRouteOverride, deleteRouteOverride } from '@/lib/services/tags';
import { verifyAdminFromRequest } from '@/lib/server/auth';

// NOTE: Minimal API route (no auth guard yet). Add admin check when auth context for server is set up.

export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  if(!path) return new Response(JSON.stringify({ error: 'Missing path'}), { status: 400 });
  try {
    const meta = await getEffectiveRouteMeta(path);
    return new Response(JSON.stringify(meta), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err:any){
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PUT(req: NextRequest){
  try {
    const auth = await verifyAdminFromRequest();
    if(!auth.admin) return new Response(JSON.stringify({ error:'Unauthorized'}), { status:401 });
    const body = await req.json();
    const { path, tags, mode, title, description } = body || {};
    if(!path || !Array.isArray(tags)) return new Response(JSON.stringify({ error: 'Invalid payload'}), { status: 400 });
    const updated = await upsertRouteOverride(path, { tags, mode, title, description });
    const effective = await getEffectiveRouteMeta(path);
    return new Response(JSON.stringify({ override: updated, effective }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err:any){
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  if(!path) return new Response(JSON.stringify({ error: 'Missing path'}), { status: 400 });
  try {
    const auth = await verifyAdminFromRequest();
    if(!auth.admin) return new Response(JSON.stringify({ error:'Unauthorized'}), { status:401 });
    await deleteRouteOverride(path);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch(err:any){
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
