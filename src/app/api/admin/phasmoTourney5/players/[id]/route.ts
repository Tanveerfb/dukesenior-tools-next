import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION = "Phasmophobia Tourney#5 Players";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: playerId } = await params;
  const body = await req.json();

  try {
    const ref = doc(db, COLLECTION, playerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const updates: any = {};
    if ("name" in body) updates.Name = String(body.name);
    if ("twitch" in body) updates.Twitch = String(body.twitch);
    if ("youtube" in body)
      updates.Youtube = body.youtube ? String(body.youtube) : "N/A";
    if ("discord" in body) updates.Discord = String(body.discord);
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
        return NextResponse.json(
          { error: "Invalid prestige" },
          { status: 400 }
        );
      }
      updates.Prestige = String(body.prestige);
    }
    if ("timezone" in body) updates.Timezone = String(body.timezone);
    if ("uid" in body) updates.UID = body.uid ? String(body.uid) : "N/A";
    if ("auditionDone" in body)
      updates.AuditionDone = body.auditionDone === true;
    if ("immune" in body) updates.Immune = body.immune === true;
    if ("status" in body) {
      if (["Active", "Inactive", "Eliminated"].includes(body.status)) {
        updates.Status = body.status;
      }
    }

    await setDoc(ref, updates, { merge: true });
    const updated = await getDoc(ref);
    const data = updated.data() as any;
    return NextResponse.json({
      id: playerId,
      name: data.Name,
      twitch: data.Twitch,
      youtube: data.Youtube,
      discord: data.Discord,
      prestige: data.Prestige,
      timezone: data.Timezone,
      uid: data.UID,
      auditionDone: Boolean(data.AuditionDone),
      immune: Boolean(data.Immune),
      status: data.Status,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to update player" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: playerId } = await params;
  try {
    const ref = doc(db, COLLECTION, playerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    await setDoc(ref, { Deleted: true }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to delete player" },
      { status: 500 }
    );
  }
}
