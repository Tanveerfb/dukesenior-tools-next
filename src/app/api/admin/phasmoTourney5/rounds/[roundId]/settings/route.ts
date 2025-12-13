import { NextRequest, NextResponse } from "next/server";
import {
  defaultGameSettings,
  type GameSettings,
} from "../../../../../../../types/gameSettings";
import { promises as fs } from "fs";
import path from "path";

const baseDir = path.join(process.cwd(), "data", "phasmoTourney5", "settings");

async function ensureDir() {
  await fs.mkdir(baseDir, { recursive: true });
}

function filePath(roundId: string) {
  return path.join(baseDir, `${roundId}.json`);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    await ensureDir();
    const fp = filePath(roundId);
    try {
      const raw = await fs.readFile(fp, "utf-8");
      const json = JSON.parse(raw);
      return NextResponse.json(json, { status: 200 });
    } catch {
      const fallback = {
        roundId,
        settings: defaultGameSettings,
        updatedBy: "system",
        updatedAt: new Date().toISOString(),
        notes: "Default settings",
      };
      return NextResponse.json(fallback, { status: 200 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to read settings" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    const body = await req.json();
    const { settings, updatedBy, notes, presetName } = body || {};

    if (!settings) {
      return NextResponse.json({ error: "Missing settings" }, { status: 400 });
    }

    // Basic validation: ensure shape has expected keys
    const valid =
      settings?.player &&
      settings?.ghost &&
      settings?.contract &&
      typeof settings.player.startingSanity === "number" &&
      typeof settings.ghost.evidenceGiven !== "undefined" &&
      typeof settings.contract.setupTimeSeconds === "number";

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid GameSettings payload" },
        { status: 400 }
      );
    }

    await ensureDir();
    const fp = filePath(roundId);
    const doc = {
      roundId,
      settings: settings as GameSettings,
      updatedBy: updatedBy || "admin",
      updatedAt: new Date().toISOString(),
      notes: notes || "",
      presetName: presetName || undefined,
    };
    await fs.writeFile(fp, JSON.stringify(doc, null, 2), "utf-8");
    return NextResponse.json(doc, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
