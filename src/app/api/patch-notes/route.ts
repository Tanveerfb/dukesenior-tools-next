import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, discordWebhook } = body || {};
    if (!title || !content) return new Response(JSON.stringify({ error: 'title and content required' }), { status: 400 });

    const repoRoot = path.resolve(process.cwd());
    const target = path.resolve(repoRoot, 'PATCH_NOTES.md');
    const entry = `\n\n## ${title}\n\n${content}`;
    await fs.appendFile(target, entry);

    // Optionally post to Discord if webhook provided
    if (discordWebhook) {
      try {
        const payload = { embeds: [{ title, description: content.slice(0, 4000), timestamp: new Date().toISOString() }] };
        await fetch(discordWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } catch (e) {
        // swallow discord errors but log
        console.error('Discord post failed', e);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error('api/patch-notes error', e);
    return new Response(JSON.stringify({ error: 'internal' }), { status: 500 });
  }
}
