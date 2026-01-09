import { taggedManifest } from '@/lib/content/tags';
import { getEffectiveRouteMeta } from '@/lib/services/tags';

export async function GET(){
  try {
    const paths = Array.from(new Set(taggedManifest.map(m => m.path)));
    const results = await Promise.all(paths.map(p => getEffectiveRouteMeta(p)));
    return new Response(JSON.stringify(results), { status:200, headers:{'Content-Type':'application/json'} });
  } catch(err:any){
    return new Response(JSON.stringify({ error: err.message }), { status:500 });
  }
}
