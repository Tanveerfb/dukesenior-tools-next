"use client";
// Redesigned Phasmo Tourney 3 bracket: responsive horizontal flow of rounds.
// Uses a data schema to keep presentation lean & consistent.
import React from "react";
import { FaTrophy } from "react-icons/fa";
import BracketMatchInfo from "@/components/tourney3/BracketMatchInfo";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { cn } from "@/lib/utils";

interface MatchDef {
  id: number;
  content: React.ReactNode;
  redemption?: boolean;
}
interface RoundDef {
  key: string;
  title: string;
  subtitle?: string;
  teamsNote?: string;
  map: string;
  matches: MatchDef[];
  redemptionMatches?: MatchDef[];
  redemptionNote?: string;
  extraNote?: string;
}

const rounds: RoundDef[] = [
  {
    key: "r1",
    title: "Round 1",
    subtitle: "Opening (8 Teams)",
    map: "Grafton Farmhouse",
    teamsNote: "4 eliminated teams may attempt Redemption.",
    matches: [
      {
        id: 1,
        content: (
          <BracketMatchInfo team1="Team 6" team2="Team 2" roundnumber={1} />
        ),
      },
      {
        id: 2,
        content: (
          <BracketMatchInfo team1="Team 3" team2="Team 5" roundnumber={1} />
        ),
      },
      {
        id: 3,
        content: (
          <BracketMatchInfo team1="Team 4" team2="Team 7" roundnumber={1} />
        ),
      },
      {
        id: 4,
        content: (
          <BracketMatchInfo team1="Team 1" team2="Team 8" roundnumber={1} />
        ),
      },
    ],
    redemptionMatches: [
      {
        id: 5,
        content: (
          <BracketMatchInfo
            team1="Team 6"
            team2="Team 7"
            roundnumber={1}
            redemption
          />
        ),
        redemption: true,
      },
      {
        id: 6,
        content: (
          <BracketMatchInfo
            team1="Team 5"
            team2="Team 8"
            roundnumber={1}
            redemption
          />
        ),
        redemption: true,
      },
    ],
    redemptionNote: "2 teams will be eliminated in this Redemption Bracket.",
  },
  {
    key: "r2",
    title: "Round 2",
    subtitle: "Main (6 Teams)",
    map: "13 Willow Street",
    teamsNote: "3 eliminated teams may attempt Redemption.",
    matches: [
      {
        id: 7,
        content: (
          <BracketMatchInfo team1="Team 1" team2="Team 4" roundnumber={2} />
        ),
      },
      {
        id: 8,
        content: (
          <BracketMatchInfo team1="Team 2" team2="Team 6" roundnumber={2} />
        ),
      },
      {
        id: 9,
        content: (
          <BracketMatchInfo team1="Team 3" team2="Team 5" roundnumber={2} />
        ),
      },
    ],
    redemptionMatches: [
      {
        id: 10,
        content: (
          <div className="flex flex-wrap items-center gap-2">
            <span>Team 3 32/50</span>
            <span className="text-foreground-muted text-sm">vs</span>
            <span>Team 4 45/50</span>
            <span className="text-foreground-muted text-sm">vs</span>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-success text-white">
              Team 6 48/50
            </span>
          </div>
        ),
        redemption: true,
      },
    ],
    redemptionNote:
      "2 teams eliminated. Each team performs two runs; combined totals decide winner.",
  },
  {
    key: "r3",
    title: "Round 3",
    subtitle: "Semifinal (4 Teams)",
    map: "Bleasdale Farmhouse",
    teamsNote: "2 eliminated teams may attempt Redemption.",
    matches: [
      {
        id: 11,
        content: (
          <BracketMatchInfo team1="Team 2" team2="Team 5" roundnumber={3} />
        ),
      },
      {
        id: 12,
        content: (
          <BracketMatchInfo team1="Team 1" team2="Team 6" roundnumber={3} />
        ),
      },
    ],
    redemptionMatches: [
      {
        id: 13,
        content: (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full text-xs font-semibold px-2.5 py-0.5 bg-success text-white">
              Team 2 49/50
            </span>
            <span className="text-sm text-foreground-muted">vs</span>
            <span>Team 2 18/25</span>
            <span className="text-sm text-foreground-muted">
              (2nd run not attempted)
            </span>
          </div>
        ),
        redemption: true,
      },
    ],
    redemptionNote: "1 team eliminated after redemption showdown.",
    extraNote: "Two runs each; aggregate compared.",
  },
  {
    key: "finals",
    title: "Finals",
    subtitle: "Best of Three (3 Teams rotation)",
    map: "Sunny Meadows Mental Institution (Restricted)",
    matches: [
      {
        id: 14,
        content: (
          <>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-success text-white mr-1">
              Team 2
            </span>
            <b className="mx-1">vs</b>
            <span>Team 5</span>
          </>
        ),
      },
      {
        id: 15,
        content: (
          <>
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-success text-white mr-1">
              Team 1
            </span>
            <b className="mx-1">vs</b>
            <span>Team 5</span>
          </>
        ),
      },
      {
        id: 16,
        content: (
          <>
            <span>Team 1</span>
            <b className="mx-1">vs</b>
            <span className="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5 bg-success text-white">
              <FaTrophy /> Team 2
            </span>
          </>
        ),
      },
    ],
    teamsNote:
      "Champion determined once a team secures decisive wins (trophy indicates champion).",
  },
];

function RoundColumn({ r }: { r: RoundDef }) {
  return (
    <div className="min-w-[280px] md:min-w-0 flex-1 flex flex-col gap-3 mb-4 md:mb-0">
      {/* Main round card */}
      <div className="h-full rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="py-2 px-3 flex flex-col gap-1 bg-primary rounded-t-xl text-white">
          <span className="font-bold text-sm uppercase">{r.title}</span>
          <span className="font-semibold text-[0.8rem]">{r.subtitle}</span>
        </div>
        <div className="p-2">
          <div className="text-sm mb-2 text-foreground-muted">
            <b>Map:</b> {r.map}
          </div>
          <ul className="divide-y divide-border dark:divide-border-dark text-sm">
            {r.matches.map((m) => (
              <li key={m.id} className="flex flex-col gap-1 py-2">
                <div>
                  <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-secondary text-white mr-2">
                    M{m.id}
                  </span>
                  {m.content}
                </div>
              </li>
            ))}
          </ul>
          {r.teamsNote && (
            <div className="mt-2 text-sm text-info">{r.teamsNote}</div>
          )}
          {r.extraNote && (
            <div className="mt-1 text-sm text-foreground-muted italic">
              {r.extraNote}
            </div>
          )}
        </div>
      </div>
      {/* Redemption card */}
      {r.redemptionMatches && (
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
          <div className="py-2 px-3 flex flex-col gap-1 bg-danger rounded-t-xl text-white">
            <span className="font-bold text-sm uppercase">
              {r.title} Redemption
            </span>
          </div>
          <div className="p-2">
            <ul className="divide-y divide-border dark:divide-border-dark text-sm">
              {r.redemptionMatches.map((m) => (
                <li key={m.id} className="flex flex-col gap-1 py-2">
                  <div>
                    <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-800 text-white mr-2">
                      M{m.id}
                    </span>
                    {m.content}
                  </div>
                </li>
              ))}
            </ul>
            {r.redemptionNote && (
              <div className="mt-2 text-sm text-danger-600 dark:text-danger">
                {r.redemptionNote}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function T3BracketPage() {
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 3", href: "/phasmotourney-series/phasmotourney3" },
    { label: "Bracket" },
  ]);

  return (
    <TourneyPage
      title="Phasmo Tourney 3 Bracket"
      subtitle="Journey from eight squads to the champion, including redemption paths."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 3" }, { label: "Bracket" }]}
      containerProps={{ className: "py-3" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div>
          <div className="text-sm text-foreground-muted">
            Progression from 8 teams to final champion with live score
            highlighting.
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-1">
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary text-white">
              Main
            </span>{" "}
            Main Round
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-danger text-white">
              R
            </span>{" "}
            Redemption
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-secondary text-white">
              M#
            </span>{" "}
            Match #
          </span>
        </div>
      </div>
      <div
        className="flex flex-nowrap gap-3 overflow-auto pb-2 md:grid md:grid-cols-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {rounds.map((r) => (
          <RoundColumn key={r.key} r={r} />
        ))}
      </div>
      <div className="mt-4 text-sm text-foreground-muted">
        Scores & winners update automatically as data changes (highlight via
        BracketMatchInfo). Redemption cards list tie-break / second-chance
        paths.
      </div>
    </TourneyPage>
  );
}
