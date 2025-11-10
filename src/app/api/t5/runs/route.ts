import { NextRequest } from "next/server";
import { addT5Run } from "@/lib/services/phasmoTourney5";
import { getRound1State } from "@/lib/services/phasmoTourney5";

// POST: create a run record (requires authenticated user)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { player, marks, runTimeMs } = body || {};
    if (!player || typeof marks !== "number" || typeof runTimeMs !== "number")
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    // capture player's selected wildcard at submission time for auditing
    const state = await getRound1State(player);
    const saved = await addT5Run({
      player,
      marks,
      runTimeMs,
      wildcard: state?.selectedWildcard,
    });
    return new Response(JSON.stringify(saved), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
