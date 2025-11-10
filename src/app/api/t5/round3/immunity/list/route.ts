import { NextRequest } from "next/server";
import { listRound3Immunity } from "@/lib/services/phasmoTourney5";

export async function GET(_req: NextRequest) {
  const list = await listRound3Immunity();
  return new Response(JSON.stringify(list), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
