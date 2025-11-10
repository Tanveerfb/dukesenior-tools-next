import { NextRequest } from "next/server";
import { verifyAdminFromRequest } from "@/lib/server/auth";
import { recordRound1Run } from "@/lib/services/phasmoTourney5";

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdminFromRequest();
    if (!auth.admin)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    const body = await req.json();
    const { player, marks, runTimeMs } = body || {};
    if (!player || typeof marks !== "number" || typeof runTimeMs !== "number")
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
      });
    const state = await recordRound1Run(player, marks, runTimeMs);
    return new Response(JSON.stringify(state), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
