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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: playerId } = await params;
  const body = await req.json();

  const players = await readPlayers();
  const playerIndex = players.findIndex((p: any) => p.id === playerId);

  if (playerIndex === -1) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const player = players[playerIndex];

  // Update allowed fields
  if ("name" in body) player.name = String(body.name);
  if ("twitch" in body) player.twitch = String(body.twitch);
  if ("youtube" in body)
    player.youtube = body.youtube ? String(body.youtube) : undefined;
  if ("discord" in body) player.discord = String(body.discord);
  if ("prestige" in body) {
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
    player.prestige = String(body.prestige);
  }
  if ("timezone" in body) player.timezone = String(body.timezone);
  if ("uid" in body) player.uid = body.uid ? String(body.uid) : undefined;
  if ("auditionDone" in body) player.auditionDone = body.auditionDone === true;
  if ("immune" in body) player.immune = body.immune === true;
  if ("status" in body) {
    if (["Active", "Inactive", "Eliminated"].includes(body.status)) {
      player.status = body.status;
    }
  }
  if ("money" in body && typeof body.money === "number")
    player.money = body.money;
  if ("currentTeamMember" in body)
    player.currentTeamMember = body.currentTeamMember
      ? String(body.currentTeamMember)
      : "";
  if ("pastTeamMembers" in body && Array.isArray(body.pastTeamMembers))
    player.pastTeamMembers = body.pastTeamMembers.map(String);
  if ("TeamNumber" in body)
    player.TeamNumber =
      typeof body.TeamNumber === "number" ? body.TeamNumber : null;

  players[playerIndex] = player;
  await writePlayers(players);

  return NextResponse.json(player);
}
