import { NextRequest } from "next/server";
import { finalizeRound3Teams } from "@/lib/services/phasmoTourney5";

// POST: { players: string[] } expecting length 7
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { players } = body || {};
    if (!Array.isArray(players) || players.length !== 7) {
      return new Response(
        JSON.stringify({ error: "players must be array length 7" }),
        { status: 400 }
      );
    }
    const result = await finalizeRound3Teams(players);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed" }), {
      status: 500,
    });
  }
}
