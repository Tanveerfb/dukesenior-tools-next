import { NextRequest } from "next/server";
import { startRound3Elimination } from "@/lib/services/phasmoTourney5";

// POST: { members: [a,b] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { members } = body || {};
    if (!Array.isArray(members) || members.length !== 2) {
      return new Response(JSON.stringify({ error: "Provide members [a,b]" }), {
        status: 400,
      });
    }
    const res = await startRound3Elimination([members[0], members[1]]);
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
