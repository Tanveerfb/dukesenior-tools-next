import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(
  process.cwd(),
  "data",
  "phasmoTourney5Round1Wildcards.json"
);

function randomChoice() {
  const items = [
    "No hiding spots",
    "Flashlight off entire run",
    "Solo spirit box only",
    "Smudge limited to 1",
    "No sanity pills",
    "No evidence run",
    "Bone must be last",
    "Photo cam only for evidence",
    "No lockers",
    "No sprint",
    "Keep lights on in ghost room",
    "Mandatory cursed item use",
  ];
  return items[Math.floor(Math.random() * items.length)];
}

async function ensureWildcards() {
  try {
    const buf = await fs.readFile(FILE, "utf-8");
    const json = JSON.parse(buf);
    if (Array.isArray(json) && json.length >= 8) return json.slice(0, 8);
  } catch (e: any) {
    if (e?.code !== "ENOENT") throw e;
  }
  const set = new Set<string>();
  while (set.size < 8) set.add(randomChoice());
  const arr = Array.from(set);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(arr, null, 2), "utf-8");
  return arr;
}

export async function GET() {
  const items = await ensureWildcards();
  return NextResponse.json(items);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Array of strings required" },
        { status: 400 }
      );
    }
    const cleaned = body.map((x) => String(x)).filter((x) => x.trim() !== "");
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(
      FILE,
      JSON.stringify(cleaned.slice(0, 32), null, 2),
      "utf-8"
    );
    return NextResponse.json(cleaned.slice(0, 32));
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to save" },
      { status: 500 }
    );
  }
}
