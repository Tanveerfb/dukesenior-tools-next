import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "Phasmophobia Tourney#5 Players";

export async function GET() {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const list = snap.docs
      .filter((d) => !(d.data() as any).Deleted)
      .map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.Name || "",
          twitch: data.Twitch || "",
          youtube: data.Youtube || undefined,
          discord: data.Discord || "",
          prestige: data.Prestige || "I",
          timezone: data.Timezone || "UTC",
          uid: data.UID || undefined,
          auditionDone: Boolean(data.AuditionDone),
          immune: Boolean(data.Immune),
          status: (data.Status as any) || "Active",
        };
      });
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to load players" },
      { status: 500 }
    );
  }
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

  try {
    const col = collection(db, COLLECTION);
    const docRef = await addDoc(col, {
      Name: String(body.name),
      Twitch: String(body.twitch),
      Youtube: body.youtube ? String(body.youtube) : "N/A",
      Discord: String(body.discord),
      Prestige: String(body.prestige),
      Timezone: String(body.timezone),
      UID: body.uid ? String(body.uid) : "N/A",
      AuditionDone: body.auditionDone === true,
      Immune: body.immune === true,
      Status: ["Active", "Inactive", "Eliminated"].includes(body.status)
        ? body.status
        : "Active",
      CreatedAt: serverTimestamp(),
    });
    const data = {
      Name: String(body.name),
      Twitch: String(body.twitch),
      Youtube: body.youtube ? String(body.youtube) : "N/A",
      Discord: String(body.discord),
      Prestige: String(body.prestige),
      Timezone: String(body.timezone),
      UID: body.uid ? String(body.uid) : "N/A",
      AuditionDone: body.auditionDone === true,
      Immune: body.immune === true,
      Status: ["Active", "Inactive", "Eliminated"].includes(body.status)
        ? body.status
        : "Active",
    } as any;
    return NextResponse.json(
      {
        id: docRef.id,
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
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to add player" },
      { status: 500 }
    );
  }
}
