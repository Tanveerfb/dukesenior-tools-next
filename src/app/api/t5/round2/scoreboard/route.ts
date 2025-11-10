import { NextRequest } from "next/server";
import { listRound2Money } from "@/lib/services/phasmoTourney5";

export async function GET(_req: NextRequest) {
  const list = await listRound2Money();
  return new Response(JSON.stringify(list), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
