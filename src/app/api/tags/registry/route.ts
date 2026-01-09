import { NextRequest } from 'next/server';
import { listTagRegistry, upsertTagRegistryEntry, deleteTagRegistryEntry } from '@/lib/services/tagRegistry';
import { verifyAdminFromRequest } from '@/lib/server/auth';

export async function GET(){
  const list = await listTagRegistry();
  return new Response(JSON.stringify(list), { status:200, headers:{'Content-Type':'application/json'} });
}

export async function PUT(req: NextRequest){
  try {
  const auth = await verifyAdminFromRequest();
  if(!auth.admin) return new Response(JSON.stringify({ error:'Unauthorized'}), { status:401 });
    const body = await req.json();
    const { name, description, color, protected: prot } = body || {};
    if(!name) return new Response(JSON.stringify({ error:'Missing name'}), { status:400 });
    const saved = await upsertTagRegistryEntry(name, { description, color, protected: prot });
    return new Response(JSON.stringify(saved), { status:200, headers:{'Content-Type':'application/json'} });
  } catch(err:any){
    return new Response(JSON.stringify({ error: err.message }), { status:500 });
  }
}

export async function DELETE(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if(!name) return new Response(JSON.stringify({ error:'Missing name'}), { status:400 });
  try { 
    const auth = await verifyAdminFromRequest();
    if(!auth.admin) return new Response(JSON.stringify({ error:'Unauthorized'}), { status:401 });
    await deleteTagRegistryEntry(name); return new Response(JSON.stringify({ ok:true }), { status:200 }); 
  } catch(err:any){ return new Response(JSON.stringify({ error: err.message }), { status:500 }); }
}
