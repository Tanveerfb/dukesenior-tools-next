import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function T3() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 3" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 3"
      subtitle="Trios, rivalries, and the first marathon broadcast. Dive back into the action."
      breadcrumbs={breadcrumbs}
      containerProps={{ className: "py-4" }}
    >
      <div className="rounded-xl border border-border bg-card shadow-sm p-5 dark:bg-card-dark dark:border-border-dark">
        <div className="flex flex-col gap-2">
          <p className="mb-0 text-foreground-secondary">
            Browse the bracket breakdowns, player stats, and memorable runs from
            tournament #3.
          </p>
          <InlineLink
            href="/phasmotourney-series/phasmotourney3"
            className="font-semibold"
          >
            Open tournament hub
          </InlineLink>
        </div>
      </div>
    </TourneyPage>
  );
}
