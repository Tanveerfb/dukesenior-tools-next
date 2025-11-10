import { NextRequest } from "next/server";
import {
  drawRound1Choices,
  getRound1Choices,
} from "@/lib/services/phasmoTourney5";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const player = searchParams.get("player");
  if (!player)
    return new Response(JSON.stringify({ error: "Missing player" }), {
      status: 400,
    });
  const existing = await getRound1Choices(player);
  return new Response(JSON.stringify(existing), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { player } = body || {};
    if (!player)
      return new Response(JSON.stringify({ error: "Missing player" }), {
        status: 400,
      });
    const drawn = await drawRound1Choices(player);
    return new Response(JSON.stringify(drawn), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
