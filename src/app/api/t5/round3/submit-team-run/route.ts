import { NextRequest } from "next/server";
import { submitRound3TeamRun } from "@/lib/services/phasmoTourney5";

// POST: { members: [a,b], money: number, map?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { members, money, map } = body || {};
    if (
      !Array.isArray(members) ||
      members.length !== 2 ||
      typeof money !== "number"
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid members or money" }),
        { status: 400 }
      );
    }
    const updated = await submitRound3TeamRun({
      members: [members[0], members[1]],
      money,
      map,
    });
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed" }), {
      status: 500,
    });
  }
}
