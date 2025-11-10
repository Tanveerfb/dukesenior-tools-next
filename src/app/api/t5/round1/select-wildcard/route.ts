import { NextRequest } from "next/server";
import { saveRound1Selection } from "@/lib/services/phasmoTourney5";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { player, wildcardId } = body || {};
    if (!player || !wildcardId)
      return new Response(
        JSON.stringify({ error: "Missing player or wildcardId" }),
        { status: 400 }
      );
    const state = await saveRound1Selection(player, wildcardId);
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
