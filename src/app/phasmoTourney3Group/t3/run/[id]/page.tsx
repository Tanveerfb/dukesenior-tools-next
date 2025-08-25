import { redirect } from 'next/navigation';

// Legacy redirect: /phasmoTourney3Group/t3/run/[id] -> /phasmotourney-series/phasmotourney3/runs/[id]
// Match project PageProps expectation where params is (unexpectedly) a Promise.
export default async function LegacyUnifiedRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/phasmotourney-series/phasmotourney3/runs/${id}`);
}
