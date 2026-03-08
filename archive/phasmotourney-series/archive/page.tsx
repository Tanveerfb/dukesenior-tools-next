"use client";

import { FaTrophy, FaUsers, FaCalendar } from "react-icons/fa";
import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { TOURNAMENT_METADATA } from "@/lib/data/tournamentArchive";

export default function ArchivePage() {
  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Archive" }]);

  return (
    <TourneyPage
      title="Tournament Archive"
      subtitle="Explore the complete history of The Lair of Evil's Phasmo Tourney series"
      breadcrumbs={breadcrumbs}
      accent="info"
      containerProps={{ className: "py-4" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOURNAMENT_METADATA.map((tournament) => (
          <div
            key={tournament.id}
            className="h-full rounded-xl border border-border bg-card shadow-sm dark:bg-card-dark dark:border-border-dark transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg"
            style={{ borderTop: `4px solid ${tournament.themeColor}` }}
          >
            <div className="flex flex-col gap-3 p-5 h-full">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="rounded-full text-xs font-medium px-2.5 py-0.5 text-white"
                      style={{
                        backgroundColor: tournament.themeColor,
                      }}
                    >
                      {tournament.shortTitle}
                    </span>
                    <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-600 text-white">
                      {tournament.status}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-foreground">
                    {tournament.title}
                  </h4>
                  <p className="mb-2 text-foreground-secondary">
                    {tournament.format}
                  </p>
                </div>
              </div>

              <p className="text-foreground-secondary text-sm">
                {tournament.description}
              </p>

              <div className="flex flex-wrap gap-3 text-foreground-secondary text-sm">
                <div className="flex items-center gap-1">
                  <FaCalendar />
                  <span>{tournament.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUsers />
                  <span>{tournament.participants} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{tournament.totalMatches} matches</span>
                </div>
              </div>

              {tournament.winner && (
                <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                  <FaTrophy className="text-yellow-500" />
                  <div>
                    <div className="text-sm text-foreground-secondary">
                      Champion
                    </div>
                    <div className="font-semibold text-foreground">
                      {tournament.winner}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <InlineLink
                  href={`/phasmotourney-series/archive/${tournament.id}`}
                  className="font-semibold"
                >
                  View Details →
                </InlineLink>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TourneyPage>
  );
}
