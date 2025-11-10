import { NextRequest } from "next/server";
import { doc, getDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

function teamId(members: string[]): string {
  return members
    .map((s) => s.toLowerCase())
    .sort()
    .join("__");
}

// GET: /api/t5/round3/elimination/state?members=a,b
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const membersParam = searchParams.get("members");
  if (!membersParam) {
    return new Response(JSON.stringify({ error: "Missing members" }), {
      status: 400,
    });
  }
  const members = membersParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (members.length !== 2) {
    return new Response(JSON.stringify({ error: "Need two members" }), {
      status: 400,
    });
  }
  const id = teamId(members);
  const ref = doc(collection(db, "t5Round3Elimination"), id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return new Response(JSON.stringify({ exists: false }), { status: 200 });
  }
  return new Response(JSON.stringify({ exists: true, ...snap.data() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
