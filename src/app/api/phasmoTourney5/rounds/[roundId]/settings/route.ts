import { NextRequest, NextResponse } from "next/server";
import { defaultGameSettings } from "../../../../../../types/gameSettings";
import { promises as fs } from "fs";
import path from "path";

const baseDir = path.join(process.cwd(), "data", "phasmoTourney5", "settings");

function filePath(roundId: string) {
  return path.join(baseDir, `${roundId}.json`);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ roundId: string }> }) {
  try {
    const { roundId } = await params;
    const fp = filePath(roundId);
    try {
      const raw = await fs.readFile(fp, "utf-8");
      const json = JSON.parse(raw);
      return NextResponse.json(json.settings ?? defaultGameSettings, { status: 200 });
    } catch {
      return NextResponse.json(defaultGameSettings, { status: 200 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed to read settings" }, { status: 500 });
  }
}
