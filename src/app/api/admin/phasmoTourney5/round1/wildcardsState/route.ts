import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

type WildcardStateItem = { name: string; used: boolean };

const COLLECTION = "Phasmophobia Tourney#5 Round1 WildcardsState";
const DOC_ID = "State";

export async function GET() {
  try {
    const ref = doc(db, COLLECTION, DOC_ID);
    const snap = await getDoc(ref);
    const items = Array.isArray((snap.data() as any)?.Items)
      ? ((snap.data() as any).Items as { Name: string; Used: boolean }[])
      : [];
    const normalized: WildcardStateItem[] = items.map((i) => ({
      name: i.Name,
      used: Boolean(i.Used),
    }));
    return NextResponse.json(normalized, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to read wildcard state" },
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
    const ref = doc(db, COLLECTION, DOC_ID);
    const items = body.map((b) => ({
      Name: String(b.name),
      Used: Boolean(b.used),
    }));
    await setDoc(
      ref,
      { Items: items, UpdatedAt: serverTimestamp() },
      { merge: true }
    );
    return NextResponse.json(body, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to save wildcard state" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const ref = doc(db, COLLECTION, DOC_ID);
    await deleteDoc(ref);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to reset wildcard state" },
      { status: 500 }
    );
  }
}
