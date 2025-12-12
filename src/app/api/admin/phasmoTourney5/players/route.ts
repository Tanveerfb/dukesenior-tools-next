import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(
  process.cwd(),
  "data",
  "phasmoTourney5Players.json"
);

async function readPlayers() {
  try {
    const buf = await fs.readFile(DATA_PATH, "utf-8");
    const json = JSON.parse(buf);
    return Array.isArray(json) ? json : [];
  } catch (e: any) {
    if (e?.code === "ENOENT") return [];
    throw e;
  }
}

async function writePlayers(players: any[]) {
  const dir = path.dirname(DATA_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(players, null, 2), "utf-8");
}

export async function GET() {
  const players = await readPlayers();
  return NextResponse.json(players);
}

export async function POST(req: Request) {
  const body = await req.json();
  const required = ["name", "twitch", "discord", "prestige", "timezone"];
  for (const k of required) {
    if (
      !(k in body) ||
      body[k] === undefined ||
      body[k] === null ||
      (typeof body[k] === "string" && body[k].trim() === "")
    ) {
      return NextResponse.json({ error: `${k} is required` }, { status: 400 });
    }
  }

  const prestigeAllowed = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
    "XIII",
    "XIV",
    "XV",
    "XVI",
    "XVII",
    "XVIII",
    "XIX",
    "XX",
  ];
  if (!prestigeAllowed.includes(body.prestige)) {
    return NextResponse.json({ error: "Invalid prestige" }, { status: 400 });
  }

  const players = await readPlayers();
  const newPlayer = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(body.name),
    twitch: String(body.twitch),
    youtube: body.youtube ? String(body.youtube) : undefined,
    discord: String(body.discord),
    prestige: String(body.prestige),
    timezone: String(body.timezone),
    uid: body.uid ? String(body.uid) : undefined,
    auditionDone: body.auditionDone === true,
    immune: body.immune === true,
    status: ["Active", "Inactive", "Eliminated"].includes(body.status)
      ? body.status
      : "Active",
    money: typeof body.money === "number" ? body.money : 0,
    currentTeamMember: body.currentTeamMember
      ? String(body.currentTeamMember)
      : "",
    pastTeamMembers: Array.isArray(body.pastTeamMembers)
      ? body.pastTeamMembers.map(String)
      : [],
    TeamNumber: typeof body.TeamNumber === "number" ? body.TeamNumber : null,
  };
  players.unshift(newPlayer);
  await writePlayers(players);
  return NextResponse.json(newPlayer, { status: 201 });
}
