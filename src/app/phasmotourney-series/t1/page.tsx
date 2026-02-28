import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";

export default function T1() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 1" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 1"
      subtitle="Catch the original brackets, submissions, and score sheets from our very first tournament."
      breadcrumbs={breadcrumbs}
      containerProps={{ className: "py-4" }}
    >
      <div className="rounded-xl border border-border bg-card shadow-sm p-5 dark:bg-card-dark dark:border-border-dark">
        <div className="flex flex-col gap-2">
          <p className="mb-0 text-foreground-secondary">
            Relive the launch edition of Phasmo Tourney and explore the archived
            tools used by the crew.
          </p>
          <InlineLink
            href="/phasmotourney-series/phasmotourney1"
            className="font-semibold"
          >
            Open tournament hub
          </InlineLink>
        </div>
      </div>
    </TourneyPage>
  );
}
