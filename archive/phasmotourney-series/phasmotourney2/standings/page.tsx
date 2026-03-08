import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function PhasmoTourney2StandingsPage() {
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 2", href: "/phasmotourney-series/phasmotourney2" },
    { label: "Standings" },
  ]);

  return (
    <TourneyPage
      title="Standings"
      subtitle="Final placements from the second Phasmo Tourney, including second chance bracket results."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 2" }, { label: "Standings" }]}
      containerProps={{ className: "py-3" }}
    >
      <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 mb-4">
        Current standings
      </div>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border dark:border-border-dark">
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                #
              </th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                Name
              </th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                Total points
              </th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                Wins/Loses/Tie
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">1</td>
              <td className="px-3 py-2 text-foreground">Izumiachi</td>
              <td className="px-3 py-2 text-foreground">60</td>
              <td className="px-3 py-2 text-foreground">3/0/0</td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">2</td>
              <td className="px-3 py-2 text-foreground">kosmichippie</td>
              <td className="px-3 py-2 text-foreground">55</td>
              <td className="px-3 py-2 text-foreground">3/0/0</td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">3</td>
              <td className="px-3 py-2 text-foreground">patsas</td>
              <td className="px-3 py-2 text-foreground">35</td>
              <td className="px-3 py-2 text-foreground">1/2/0</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 text-center mb-4">
        Second chance bracket
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border dark:border-border-dark">
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                #
              </th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                Name
              </th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                Points [Total points]
              </th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                Time taken
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">
                <b>Winner</b>
              </td>
              <td className="px-3 py-2 text-foreground">bgflareon</td>
              <td className="px-3 py-2 text-foreground">18[36]</td>
              <td className="px-3 py-2 text-foreground">07:38</td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">2</td>
              <td className="px-3 py-2 text-foreground">ram_Fighter</td>
              <td className="px-3 py-2 text-foreground">18[18]</td>
              <td className="px-3 py-2 text-foreground">14:51</td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">3</td>
              <td className="px-3 py-2 text-foreground">hannah_49_</td>
              <td className="px-3 py-2 text-foreground">8[18]</td>
              <td className="px-3 py-2 text-foreground">16:46</td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">3</td>
              <td className="px-3 py-2 text-foreground">Kaz</td>
              <td className="px-3 py-2 text-foreground">4[28]</td>
              <td className="px-3 py-2 text-foreground">06:58</td>
            </tr>
          </tbody>
        </table>
      </div>
    </TourneyPage>
  );
}
