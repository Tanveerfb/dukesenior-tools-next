import { closeVotingSession } from "@/lib/services/phasmoTourney5";

// Expected body: { sessionId: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body || {};
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing sessionId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = await closeVotingSession(sessionId);
    if (!result.ok) {
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to close session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
