import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type WildcardStateItem = { name: string; used: boolean };

const baseDir = path.join(process.cwd(), "data", "phasmoTourney5");
const stateFile = path.join(baseDir, "round1WildcardsState.json");

async function ensureDir() {
  await fs.mkdir(baseDir, { recursive: true });
}

export async function GET() {
  try {
    await ensureDir();
    try {
      const raw = await fs.readFile(stateFile, "utf-8");
      const json = JSON.parse(raw) as WildcardStateItem[];
      return NextResponse.json(json, { status: 200 });
    } catch {
      return NextResponse.json([], { status: 200 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to read wildcard state" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as WildcardStateItem[];
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await ensureDir();
    await fs.writeFile(stateFile, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save wildcard state" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await ensureDir();
    try {
      await fs.unlink(stateFile);
    } catch {}
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to reset wildcard state" },
      { status: 500 }
    );
  }
}
