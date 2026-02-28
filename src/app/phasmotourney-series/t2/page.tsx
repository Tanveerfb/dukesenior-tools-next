import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function T2() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 2" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 2"
      subtitle="The sequel brought tougher brackets and new storylines. Grab the highlights below."
      breadcrumbs={breadcrumbs}
      containerProps={{ className: "py-4" }}
    >
      <div className="rounded-xl border border-border bg-card shadow-sm p-5 dark:bg-card-dark dark:border-border-dark">
        <div className="flex flex-col gap-2">
          <p className="mb-0 text-foreground-secondary">
            Review match archives, standings, and stat recaps from tournament
            #2.
          </p>
          <InlineLink
            href="/phasmotourney-series/phasmotourney2"
            className="font-semibold"
          >
            Open tournament hub
          </InlineLink>
        </div>
      </div>
    </TourneyPage>
  );
}
