import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function T4() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 4" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 4"
      subtitle="The season where playoffs went wild and legends were born."
      breadcrumbs={breadcrumbs}
      containerProps={{ className: "py-4" }}
    >
      <div className="rounded-xl border border-border bg-card shadow-sm p-5 dark:bg-card-dark dark:border-border-dark">
        <div className="flex flex-col gap-2">
          <p className="mb-0 text-foreground-secondary">
            Jump into standings, match archives, and recorded runs for the
            fourth tournament.
          </p>
          <InlineLink
            href="/phasmotourney-series/phasmotourney4"
            className="font-semibold"
          >
            Open tournament hub
          </InlineLink>
        </div>
      </div>
    </TourneyPage>
  );
}
