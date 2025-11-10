import { NextRequest } from "next/server";
import { verifyAdminFromRequest } from "@/lib/server/auth";
import {
  computeRound1Immunity,
  getRound1State,
  setRound1State,
  PlayerRoundState,
} from "@/lib/services/phasmoTourney5";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminFromRequest();
    if (!auth.admin)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    const snap = await getDocs(collection(db, "t5Round1State"));
    const states: PlayerRoundState[] = [];
    snap.forEach((d) => states.push(d.data() as PlayerRoundState));
    const immunized = computeRound1Immunity(states);
    await Promise.all(
      immunized.map((s) => setRound1State(s.name, { immune: s.immune }))
    );
    return new Response(JSON.stringify(immunized), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
