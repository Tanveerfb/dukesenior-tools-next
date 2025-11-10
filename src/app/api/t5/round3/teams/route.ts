import { NextRequest } from "next/server";
import { listRound3Teams } from "@/lib/services/phasmoTourney5";

export async function GET(_req: NextRequest) {
  const data = await listRound3Teams();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
