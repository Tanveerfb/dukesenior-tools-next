import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
// Public voting: optional token verification; accepts voter info from body when no token
import { adminDb } from "@/lib/firebase/admin";

const SESSIONS_PATH = path.join(
  process.cwd(),
  "data",
  "phasmoTourney5VoteSessions.json"
);
const VOTES_PATH = path.join(process.cwd(), "data", "phasmoTourney5Votes.json");
const PLAYERS_PATH = path.join(
  process.cwd(),
  "data",
  "phasmoTourney5Players.json"
);

async function readJson(file: string) {
  try {
    const buf = await fs.readFile(file, "utf-8");
    const json = JSON.parse(buf);
    return Array.isArray(json) ? json : [];
  } catch (e: any) {
    if (e?.code === "ENOENT") return [];
    throw e;
  }
}

async function writeJson(file: string, items: any[]) {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(items, null, 2), "utf-8");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  let voterUid: string | undefined;
  let voterName: string | undefined;
  try {
    // Lazy import to avoid hard dependency if removed elsewhere
    const { verifyIdToken } = await import("@/lib/server/auth");
    const decoded = await verifyIdToken(token?.toString());
    if (decoded?.uid) {
      voterUid = decoded.uid;
      voterName = (decoded as any)?.name || decoded.email || decoded.uid;
    }
  } catch {}

  const body = await req.json();
  // Fallback to client-provided identifiers when no valid token
  if (!voterUid) voterUid = body?.voterUid;
  if (!voterName) voterName = body?.voterName || voterUid;
  if (!voterUid)
    return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const [sessions, votes, players] = await Promise.all([
    readJson(SESSIONS_PATH),
    readJson(VOTES_PATH),
    readJson(PLAYERS_PATH),
  ]);

  const session = sessions.find((s: any) => s.id === sessionId);
  if (!session)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.closed)
    return NextResponse.json({ error: "Session closed" }, { status: 400 });

  // Enforce one vote per user per session
  if (
    votes.some((v: any) => v.sessionId === sessionId && v.voterUid === voterUid)
  ) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  const choicePlayerId = String(body.choicePlayerId || "");
  if (!choicePlayerId)
    return NextResponse.json(
      { error: "choicePlayerId required" },
      { status: 400 }
    );

  // Validate choice based on session config
  const activePlayers = players.filter((p: any) => p.status === "Active");
  const pool =
    session.type === "vote-out"
      ? activePlayers.filter((p: any) => !p.immune)
      : activePlayers;

  // For pick-ally, optionally exclude subject player if provided
  const poolIds = new Set(
    pool
      .filter((p: any) =>
        session.type === "pick-ally" && session.subjectPlayerId
          ? p.id !== session.subjectPlayerId
          : true
      )
      .map((p: any) => p.id)
  );

  if (!poolIds.has(choicePlayerId)) {
    return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
  }

  const vote = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sessionId,
    voterUid,
    voterName,
    choicePlayerId,
    createdAt: Date.now(),
  };
  votes.push(vote);
  await writeJson(VOTES_PATH, votes);
  try {
    // Also persist to Firestore for live dashboards
    await adminDb.collection("t5_votes").doc(vote.id).set(vote);
  } catch {}
  return NextResponse.json(vote, { status: 201 });
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const votes = await readJson(VOTES_PATH);
  const sessionVotes = votes.filter((v: any) => v.sessionId === sessionId);
  return NextResponse.json(sessionVotes);
}
