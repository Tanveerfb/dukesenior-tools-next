import { NextRequest } from "next/server";
import {
  getRound1State,
  getRound1Choices,
} from "@/lib/services/phasmoTourney5";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const player = searchParams.get("player");
  if (!player)
    return new Response(JSON.stringify({ error: "Missing player" }), {
      status: 400,
    });
  const [state, choices] = await Promise.all([
    getRound1State(player),
    getRound1Choices(player),
  ]);
  return new Response(JSON.stringify({ state, choices }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
