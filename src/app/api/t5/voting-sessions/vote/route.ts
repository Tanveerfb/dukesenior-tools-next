import { castVote } from "@/lib/services/phasmoTourney5";

// Expected body: { sessionId: string, uid: string, candidateId: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, uid, candidateId } = body || {};
    if (!sessionId || !uid || !candidateId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId, uid, or candidateId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const result = await castVote(sessionId, uid, candidateId);
    if (!result.ok) {
      const status =
        result.error === "Already voted"
          ? 409
          : result.error === "Session closed"
          ? 409
          : 400;
      return new Response(JSON.stringify(result), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to cast vote" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
