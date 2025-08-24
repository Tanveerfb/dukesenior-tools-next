import { redirect } from 'next/navigation';

// Legacy redirect: /tourney3rundetails/[id] -> unified runs detail path
export default async function LegacyRunDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/phasmoTourney3Group/t3/runs/${id}`);
}

