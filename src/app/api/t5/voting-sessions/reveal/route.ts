import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// POST { sessionId: string, revealed: boolean }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, revealed } = body || {};
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing sessionId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const ref = doc(collection(db, "t5VotingSessions"), sessionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    await setDoc(ref, { revealed: revealed !== false }, { merge: true });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to update reveal" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
