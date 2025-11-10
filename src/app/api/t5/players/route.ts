import { NextRequest } from "next/server";
import { addT5Player } from "@/lib/services/phasmoTourney5";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      preferredName,
      twitch,
      youtube,
      steam,
      phasmoHours,
      prestigeAtAdmission,
      previousTourney,
    } = body || {};
    if (!preferredName)
      return new Response(JSON.stringify({ error: "Missing preferredName" }), {
        status: 400,
      });
    const saved = await addT5Player({
      preferredName,
      twitch,
      youtube,
      steam,
      phasmoHours,
      prestigeAtAdmission,
      previousTourney,
    });
    return new Response(JSON.stringify(saved), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
