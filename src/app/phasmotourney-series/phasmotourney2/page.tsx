import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

const rounds = [
  {
    title: "Round 1 (Group matches) [Ridgeview Court]",
    note: "4 Eliminated players can choose to grab another fighting chance in Second Chance Bracket",
    matches: [
      "Match 1 : Ram_Fighter vs <b>patsas</b>",
      "Match 2 : <b>KosmicHippie</b> vs Hannah_49_",
      "Match 3 : Enokiacat vs <b>Gre_Kaz</b>",
      "Match 4 : bgflareon vs <b>Izumiachi</b>",
    ],
  },
  {
    title: "Round 2 (Group matches) [Willow street]",
    note: "1 player was eliminated at the end of Round 2",
    matches: [
      "Match 5 : <b>Izumiachi</b> vs patsas",
      "Match 6 : <b>KosmicHippie</b> vs Kaz",
      "Match 7 : <b>Izumiachi</b> vs Kaz",
      "Match 8 : <b>KosmicHippie</b> vs patsas",
    ],
  },
  {
    title: "Second Chance Bracket [Tanglewood Drive]",
    note: "Winner earned a chance to play in the playoffs",
    matches: [
      "SCB Elimination Match : @Hannah_49_ vs <b>@bgflareon</b> vs @Ram_Fighter vs @Gre_Kaz",
    ],
  },
  {
    title: "Round 3 (Play offs) [Grafton Farmhouse]",
    note: "2 players were eliminated from the tourney at the end of Round 3",
    matches: [
      "Match 9 : <b>Izumiachi</b> vs KosmicHippie",
      "Match 10 : patsas vs <b>bgflareon</b>",
      "Match 11 : <b>KosmicHippie</b> vs bgflareon",
    ],
  },
  {
    title: "Round 4 (Final) [Sunny Meadows Restricted]",
    note: "The winner of the tournament was decided in this round!",
    matches: ["Final [Best out of 3] : <b>Izumiachi</b> vs KosmicHippie"],
  },
];

export default function PhasmoTourney2BracketPage() {
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 2", href: "/phasmotourney-series/phasmotourney2" },
    { label: "Brackets" },
  ]);

  return (
    <TourneyPage
      title="Phasmo Tourney 2 Brackets"
      subtitle="Historic bracket recap covering every round from group stage to final showdown."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 2" }, { label: "Bracket" }]}
      containerProps={{ className: "py-3" }}
    >
      <div className="mb-3 rounded-lg border border-blue-300 bg-blue-50 p-4 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200">
        The brackets of the tournament. <br /> <strong>Bold</strong> denotes the
        winner in each match.
      </div>

      <div className="flex flex-col gap-3">
        {rounds.map((r, i) => (
          <div
            className="rounded-xl border border-border bg-card shadow-sm dark:bg-card-dark dark:border-border-dark overflow-hidden"
            key={i}
          >
            <div className="border-b border-border dark:border-border-dark px-5 py-3 font-bold text-foreground">
              {r.title}
            </div>
            <div className="p-5">
              <ul className="divide-y divide-border dark:divide-border-dark">
                {r.matches &&
                  r.matches.map((m, idx) => (
                    <li
                      className="px-3 py-2 text-foreground"
                      key={`${i}-${idx}`}
                      dangerouslySetInnerHTML={{ __html: m }}
                    />
                  ))}
              </ul>
            </div>
            <div className="border-t border-border dark:border-border-dark px-5 py-3 text-sm text-foreground-secondary">
              {r.note}
            </div>
          </div>
        ))}
      </div>
    </TourneyPage>
  );
}
