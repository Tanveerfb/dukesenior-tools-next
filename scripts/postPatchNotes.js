#!/usr/bin/env node
/*
 CLI helper: post the topmost patch note section from PATCH_NOTES.md to a Discord webhook
 Usage:
   node scripts/postPatchNotes.js --webhook=https://discord.com/api/webhooks/XXX
   or set DISCORD_WEBHOOK_URL in env and run with no args
 Optional:
   --file=path/to/PATCH_NOTES.md   # default is ./PATCH_NOTES.md
   --append=path/to/new.md         # append new.md to PATCH_NOTES.md and post the appended section
*/

const fs = require('fs').promises;
const path = require('path');

function parseArgs() {
  const args = {};
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=');
    args[k.replace(/^--/, '')] = v === undefined ? true : v;
  }
  return args;
}

async function postToDiscord(webhookUrl, title, body) {
  if (!webhookUrl) throw new Error('No webhook URL provided');
  // Discord embed description max length ~4096. Truncate if needed.
  const max = 4000;
  const description = body.length > max ? body.slice(0, max - 3) + '...' : body;

  const payload = {
    embeds: [
      {
        title: title || 'Patch Notes',
        description,
        timestamp: new Date().toISOString()
      }
    ]
  };

  const fetchFn = (typeof fetch !== 'undefined') ? fetch : (url, opts) => {
    return require('node-fetch')(url, opts);
  };
  const res = await fetchFn(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Discord webhook failed: ${res.status} ${txt}`);
  }
  return true;
}

function extractTopSection(markdown) {
  // Find the most recent (last) "## " heading block and extract until next "## " or EOF
  const lines = markdown.split(/\r?\n/);
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) starts.push(i);
  }
  if (starts.length === 0) return { title: 'Patch Notes', body: markdown };
  const start = starts[starts.length - 1];
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) { end = i; break; }
  }
  const section = lines.slice(start, end).join('\n');
  const titleLine = lines[start].replace(/^##\s+/, '').trim();
  return { title: titleLine, body: section };
}

async function appendFile(targetPath, content) {
  await fs.appendFile(targetPath, '\n\n' + content);
}

(async function main(){
  try {
    const args = parseArgs();
    const repoRoot = path.resolve(process.cwd());
    const target = path.resolve(repoRoot, args.file || 'PATCH_NOTES.md');
    const webhook = args.webhook || process.env.DISCORD_WEBHOOK_URL;

    if (args.append) {
      const newPath = path.resolve(process.cwd(), args.append);
      const newContent = await fs.readFile(newPath, 'utf8');
      await appendFile(target, newContent);
      console.log('Appended new content to', target);
      // post the appended content (we'll post the last appended section)
      const full = await fs.readFile(target, 'utf8');
      const { title, body } = extractTopSection(full);
      if (!webhook) { console.log('No webhook provided; done.'); return; }
      await postToDiscord(webhook, title, body);
      console.log('Posted appended patch notes to Discord.');
      return;
    }

    const md = await fs.readFile(target, 'utf8');
    const { title, body } = extractTopSection(md);
    if (!webhook) { console.log('No webhook provided; nothing posted. Extracted section:\n', title); console.log(body); return; }
    await postToDiscord(webhook, title, body);
    console.log('Posted patch notes to Discord:', title);
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  }
})();
