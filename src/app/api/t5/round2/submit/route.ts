import { NextRequest } from "next/server";
import { recordRound2Money } from "@/lib/services/phasmoTourney5";

// POST body: { player: string, money: number, map?: string, notes?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { player, money, map, notes } = body || {};
    if (!player || typeof money !== "number") {
      return new Response(
        JSON.stringify({ error: "Missing player or money" }),
        { status: 400 }
      );
    }
    const entry = await recordRound2Money({ player, money, map, notes });
    return new Response(JSON.stringify(entry), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed" }), {
      status: 500,
    });
  }
}
