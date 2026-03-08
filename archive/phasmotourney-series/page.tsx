"use client";

import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

const SERIES_ITEMS = [
  {
    id: "t5",
    title: "Phasmo Tourney 5",
    href: "/phasmotourney-series/phasmoTourney5",
    blurb:
      "Ultimate survival challenge with eliminations, voting, and immunity battles.",
  },
  {
    id: "t4",
    title: "Phasmo Tourney 4",
    href: "/phasmotourney-series/phasmotourney4",
    blurb:
      "Dual-bracket showdown featuring the playoff gauntlet and stat dashboards.",
  },
  {
    id: "t3",
    title: "Phasmo Tourney 3",
    href: "/phasmotourney-series/phasmotourney3",
    blurb:
      "Toughest duo battles yet, complete with recorded runs and standings.",
  },
  {
    id: "t2",
    title: "Phasmo Tourney 2",
    href: "/phasmotourney-series/phasmotourney2",
    blurb:
      "Expanded field, revamped scoring, and the return of crowd favourites.",
  },
  {
    id: "t1",
    title: "Phasmo Tourney 1",
    href: "/phasmotourney-series/phasmotourney1",
    blurb:
      "Where it all began—original bracket, tools, and community highlights.",
  },
];

export default function SeriesIndex() {
  const breadcrumbs = buildTourneyBreadcrumbs([]);

  return (
    <TourneyPage
      title="Phasmo Tourney Series"
      subtitle="Explore every bracket, stat sheet, and run archive from The Lair of Evil community events."
      breadcrumbs={breadcrumbs}
      accent="info"
      containerProps={{ className: "py-4" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {SERIES_ITEMS.map((item) => (
          <div
            key={item.id}
            className="h-full rounded-xl border border-border bg-card shadow-sm dark:bg-card-dark dark:border-border-dark"
          >
            <div className="flex flex-col justify-between gap-3 p-5 h-full">
              <div className="flex flex-col gap-1">
                <h5 className="text-lg font-semibold mb-0 text-foreground">
                  {item.title}
                </h5>
                <p className="text-foreground-secondary text-sm mb-0">
                  {item.blurb}
                </p>
              </div>
              <div>
                <InlineLink href={item.href} className="font-semibold">
                  View bracket
                </InlineLink>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TourneyPage>
  );
}
