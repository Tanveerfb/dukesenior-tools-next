import { NextRequest } from "next/server";
import {
  recordRound3Vote,
  listRound3Votes,
} from "@/lib/services/phasmoTourney5";

// POST: { voter: string, partner: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voter, partner } = body || {};
    if (!voter || !partner) {
      return new Response(
        JSON.stringify({ error: "Missing voter or partner" }),
        { status: 400 }
      );
    }
    const vote = await recordRound3Vote(voter, partner);
    return new Response(JSON.stringify(vote), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed" }), {
      status: 500,
    });
  }
}

// GET: list votes
export async function GET(_req: NextRequest) {
  const list = await listRound3Votes();
  return new Response(JSON.stringify(list), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
