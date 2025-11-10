import { NextRequest } from "next/server";
import { setRound3Teams } from "@/lib/services/phasmoTourney5";

// POST: { teams: [[a,b],[c,d],[e,f]], leftover?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teams, leftover } = body || {};
    if (!Array.isArray(teams) || teams.length === 0) {
      return new Response(
        JSON.stringify({ error: "Provide teams as array of pairs" }),
        { status: 400 }
      );
    }
    const ok = teams.every((t: any) => Array.isArray(t) && t.length === 2);
    if (!ok)
      return new Response(
        JSON.stringify({ error: "Each team must be [a,b]" }),
        { status: 400 }
      );
    const res = await setRound3Teams(teams as [string, string][], leftover);
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
