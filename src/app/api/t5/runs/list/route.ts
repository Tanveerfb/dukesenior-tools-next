import { getT5Runs } from "@/lib/services/phasmoTourney5";

export async function GET() {
  const runs = await getT5Runs();
  return new Response(JSON.stringify(runs), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
