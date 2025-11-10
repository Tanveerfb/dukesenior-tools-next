import { createVotingSession } from "@/lib/services/phasmoTourney5";

// Expected body: { round: number, immunePlayerIds: string[] }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { round, immunePlayerIds } = body || {};
    if (typeof round !== "number" || !Array.isArray(immunePlayerIds)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Client-side admin gating only per user spec (useAuth().admin). No server token check.
    const session = await createVotingSession(round, immunePlayerIds);
    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to create session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
