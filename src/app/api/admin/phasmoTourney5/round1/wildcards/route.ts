import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const COLLECTION = "Phasmophobia Tourney#5 Round1 Wildcards";
const DOC_ID = "Choices";

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
  const ref = doc(db, COLLECTION, DOC_ID);
  const snap = await getDoc(ref);
  const existing: string[] = Array.isArray((snap.data() as any)?.Values)
    ? ((snap.data() as any).Values as string[])
    : [];
  if (existing.length >= 8) return existing.slice(0, 8);
  const set = new Set<string>();
  while (set.size < 8) set.add(randomChoice());
  const arr = Array.from(set);
  await setDoc(
    ref,
    { Values: arr, UpdatedAt: serverTimestamp() },
    { merge: true }
  );
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
    const values = cleaned.slice(0, 32);
    const ref = doc(db, COLLECTION, DOC_ID);
    await setDoc(
      ref,
      { Values: values, UpdatedAt: serverTimestamp() },
      { merge: true }
    );
    return NextResponse.json(values);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to save" },
      { status: 500 }
    );
  }
}
