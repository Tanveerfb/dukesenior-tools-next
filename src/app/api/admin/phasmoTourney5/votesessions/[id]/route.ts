import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
// Admin gating handled client-side via useAuth().admin

const SESSIONS_PATH = path.join(
  process.cwd(),
  "data",
  "phasmoTourney5VoteSessions.json"
);

async function readSessions() {
  try {
    const buf = await fs.readFile(SESSIONS_PATH, "utf-8");
    const json = JSON.parse(buf);
    return Array.isArray(json) ? json : [];
  } catch (e: any) {
    if (e?.code === "ENOENT") return [];
    throw e;
  }
}

async function writeSessions(items: any[]) {
  const dir = path.dirname(SESSIONS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SESSIONS_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessions = await readSessions();
  const session = sessions.find((s: any) => s.id === id);
  if (!session)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Trust client-side admin gating; no server token verification here

  const { id } = await params;
  const body = await req.json();

  const sessions = await readSessions();
  const idx = sessions.findIndex((s: any) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = sessions[idx];
  if ("closed" in body) {
    session.closed = body.closed === true;
    session.closedAt = session.closed ? Date.now() : undefined;
  }
  if ("name" in body) session.name = String(body.name);

  sessions[idx] = session;
  await writeSessions(sessions);
  return NextResponse.json(session);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessions = await readSessions();
  const idx = sessions.findIndex((s: any) => s.id === id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const removed = sessions[idx];
  sessions.splice(idx, 1);
  await writeSessions(sessions);
  return NextResponse.json({ ok: true, removed });
}
