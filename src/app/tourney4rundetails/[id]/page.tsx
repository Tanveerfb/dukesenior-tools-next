import { redirect } from 'next/navigation';

// Legacy redirect: /tourney4rundetails/[id] -> unified Tourney 4 runs detail path
export default async function LegacyTourney4RunDetailsRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/phasmoTourney4Group/t4/runs/${id}`);
}

