import { NextRequest } from "next/server";
import { resolveRound3Elimination } from "@/lib/services/phasmoTourney5";

// POST: { members:[a,b] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { members } = body || {};
    if (!Array.isArray(members) || members.length !== 2) {
      return new Response(JSON.stringify({ error: "Invalid members" }), {
        status: 400,
      });
    }
    const res = await resolveRound3Elimination([members[0], members[1]]);
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
