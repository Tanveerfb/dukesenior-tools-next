import { NextRequest } from "next/server";
import { setRound3Immunity } from "@/lib/services/phasmoTourney5";

// POST: { player: string, immune: boolean }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { player, immune } = body || {};
    if (!player || typeof immune !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Missing player or immune" }),
        { status: 400 }
      );
    }
    const res = await setRound3Immunity(player, immune);
    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed" }), {
      status: 500,
    });
  }
}
