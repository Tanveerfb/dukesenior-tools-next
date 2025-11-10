import { listVotingSessions } from "@/lib/services/phasmoTourney5";

// Optional query: ?round=1
export async function GET(req: Request) {
  const url = new URL(req.url);
  const roundStr = url.searchParams.get("round");
  const round = roundStr ? Number(roundStr) : undefined;
  const list = await listVotingSessions(
    typeof round === "number" && !Number.isNaN(round) ? round : undefined
  );
  return new Response(JSON.stringify(list), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
