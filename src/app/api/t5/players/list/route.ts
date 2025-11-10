import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { T5PlayerProfile } from "@/lib/services/phasmoTourney5";

export async function GET() {
  const snap = await getDocs(collection(db, "t5Players"));
  const list: T5PlayerProfile[] = [];
  snap.forEach((d) => list.push(d.data() as T5PlayerProfile));
  list.sort((a, b) => a.preferredName.localeCompare(b.preferredName));
  return new Response(JSON.stringify(list), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
