"use client";

import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

const TOURNEY5_ITEMS = [
  {
    id: "timeline",
    title: "Tournament Timeline",
    href: "/phasmotourney-series/phasmoTourney5/timeline",
    blurb:
      "Round-by-round breakdown of eliminations, votes, challenges, and immunities.",
  },
  {
    id: "whats-next",
    title: "What's Next?",
    href: "/phasmotourney-series/phasmoTourney5/whats-next",
    blurb: "Upcoming round details, schedule, and immune players.",
  },
  {
    id: "recorded-runs",
    title: "Recorded Run Details",
    href: "/phasmotourney-series/phasmoTourney5/recorded-run-details",
    blurb: "Complete archive of all recorded runs with detailed scoring.",
  },
  {
    id: "eliminator",
    title: "Eliminator Sessions",
    href: "/phasmotourney-series/phasmoTourney5/eliminator-sessions-data",
    blurb: "Challenge outcomes between players across all rounds.",
  },
  {
    id: "vote-sessions",
    title: "Vote Sessions",
    href: "/phasmotourney-series/phasmoTourney5/vote-sessions-data",
    blurb: "Community voting results and player elimination tallies.",
  },
  {
    id: "videos",
    title: "Videos & Streams",
    href: "/phasmotourney-series/phasmoTourney5/videos-and-stream-links",
    blurb: "Watch highlights and stream recordings from the tournament.",
  },
  {
    id: "rules",
    title: "Rules & Settings",
    href: "/phasmotourney-series/phasmoTourney5/rules-and-settings",
    blurb: "Game settings and tournament rules for each round.",
  },
];

export default function PhasmoTourney5Index() {
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney Series", href: "/phasmotourney-series" },
    { label: "Phasmo Tourney 5" },
  ]);

  return (
    <TourneyPage
      title="Phasmo Tourney 5"
      subtitle="Follow the ultimate survival challenge with eliminations, voting, and immunity battles."
      breadcrumbs={breadcrumbs}
      accent="primary"
      containerProps={{ className: "py-4" }}
    >
      <div className="grid grid-cols-12 gap-3">
        {TOURNEY5_ITEMS.map((item) => (
          <div
            key={item.id}
            className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3"
          >
            <div className="h-full rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm">
              <div className="p-4 flex flex-col justify-between gap-3 h-full">
                <div className="flex flex-col gap-1">
                  <h5 className="text-lg font-semibold m-0">{item.title}</h5>
                  <p className="text-foreground/50 text-sm m-0">{item.blurb}</p>
                </div>
                <div>
                  <InlineLink href={item.href} className="font-semibold">
                    View details
                  </InlineLink>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TourneyPage>
  );
}
