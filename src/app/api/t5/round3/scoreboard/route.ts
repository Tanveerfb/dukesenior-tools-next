import { NextRequest } from "next/server";
import { listRound3Scoreboard } from "@/lib/services/phasmoTourney5";

export async function GET(_req: NextRequest) {
  const list = await listRound3Scoreboard();
  return new Response(JSON.stringify(list), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
