import RunsClient from "./runsClient";
import { fetchTourney4Runs } from "../../../lib/firebase/legacy/phasmoT4Adapter";

export default async function Tourney4Page() {
  const initialRuns = await fetchTourney4Runs();
  return (
    <main className="container py-4">
      <h2>Phasmophobia Tourney #4 Runs</h2>
      <RunsClient initialRuns={initialRuns} />
    </main>
  );
}
