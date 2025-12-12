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

export async function GET() {
  const sessions = await readSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  // Trust client-side admin gating; no server token verification here

  const body = await req.json();
  const required = ["name", "type"];
  for (const k of required) {
    if (
      body[k] === undefined ||
      body[k] === null ||
      (typeof body[k] === "string" && body[k].trim() === "")
    ) {
      return NextResponse.json({ error: `${k} is required` }, { status: 400 });
    }
  }

  if (!["vote-out", "pick-ally"].includes(body.type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const sessions = await readSessions();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const pathOnly = `/phasmotourney-series/phasmoTourney5/vote/${id}`;
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.startsWith("localhost") ? "http" : "https");
  const link = `${proto}://${host}${pathOnly}`;
  const isAnonymous = body.type === "vote-out";
  const newSession = {
    id,
    name: String(body.name),
    type: body.type as "vote-out" | "pick-ally",
    anonymous: isAnonymous,
    selectionPool:
      body.type === "vote-out" ? "non-immune-active" : "all-active",
    closed: false,
    createdAt: Date.now(),
    closedAt: undefined,
    link,
  };
  sessions.unshift(newSession);
  await writeSessions(sessions);
  return NextResponse.json(newSession, { status: 201 });
}
