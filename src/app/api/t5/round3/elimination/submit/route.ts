import { NextRequest } from "next/server";
import { submitRound3EliminationRun } from "@/lib/services/phasmoTourney5";

// POST: { members:[a,b], player:string, money:number }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { members, player, money } = body || {};
    if (
      !Array.isArray(members) ||
      members.length !== 2 ||
      !player ||
      typeof money !== "number"
    ) {
      return new Response(JSON.stringify({ error: "Invalid body" }), {
        status: 400,
      });
    }
    const res = await submitRound3EliminationRun({
      teamMembers: [members[0], members[1]],
      player,
      money,
    });
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
