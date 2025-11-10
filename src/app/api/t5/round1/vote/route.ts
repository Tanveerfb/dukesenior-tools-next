import { NextRequest } from "next/server";
import { verifyAdminFromRequest } from "@/lib/server/auth";
import { setRound1State } from "@/lib/services/phasmoTourney5";

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdminFromRequest();
    if (!auth.admin)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    const body = await req.json();
    const { voter, candidate } = body || {};
    if (!voter || !candidate)
      return new Response(
        JSON.stringify({ error: "Missing voter or candidate" }),
        { status: 400 }
      );
    const updated = await setRound1State(voter, { votedFor: candidate });
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
