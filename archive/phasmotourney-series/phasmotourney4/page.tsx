"use client";
import { useMemo, useState } from "react";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import matchesData from "@/data/phasmoTourney4Matches.json";
import { cn } from "@/lib/utils";

interface MatchJSON {
  match: number;
  bracket: "Bracket 1" | "Bracket 2" | "Playoffs";
  player1: string;
  score1: number;
  player2: string;
  score2: number;
  winner?: string;
}

// Presentational card built entirely from static JSON record
function StaticMatchCard({
  m,
  onClick,
}: {
  m: MatchJSON;
  onClick: () => void;
}) {
  const isTie =
    (m.score1 === m.score2 && m.score1 !== 0) ||
    (!m.winner && m.score1 === m.score2 && m.bracket !== "Playoffs");
  const resolvedWinner =
    m.winner ||
    (m.score1 > m.score2
      ? m.player1
      : m.score2 > m.score1
        ? m.player2
        : undefined);
  let summary: string;
  if (m.winner && m.match === 10 && m.bracket === "Playoffs") {
    summary = `Champion: ${m.winner}`;
  } else if (isTie) {
    summary = `${m.player1} ${m.score1} – ${m.score2} ${m.player2} • Tie`;
  } else if (resolvedWinner) {
    summary = `${m.player1} ${m.score1} – ${m.score2} ${m.player2} • ${resolvedWinner} wins`;
  } else {
    summary = "Result pending migration";
  }
  return (
    <div
      className="mb-2 rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm cursor-pointer hover:ring-2 hover:ring-primary transition-shadow"
      role="button"
      onClick={onClick}
      aria-label={`Match ${m.match} ${m.player1} versus ${m.player2} ${summary}`}
    >
      <div className="py-2 px-3">
        <div className="flex justify-between items-start mb-1">
          <span className="text-sm text-foreground-muted">Match {m.match}</span>
          {m.bracket === "Playoffs" && (
            <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-warning text-gray-900">
              Playoffs
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span
              className={cn(
                "font-semibold",
                resolvedWinner === m.player1 && !isTie && "text-success",
              )}
            >
              {m.player1}
            </span>
            <span
              className={cn(
                "rounded-full text-xs font-medium px-2.5 py-0.5 text-white",
                resolvedWinner === m.player1 && !isTie
                  ? "bg-success"
                  : "bg-secondary",
              )}
            >
              {m.score1}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className={cn(
                "font-semibold",
                resolvedWinner === m.player2 && !isTie && "text-success",
              )}
            >
              {m.player2}
            </span>
            <span
              className={cn(
                "rounded-full text-xs font-medium px-2.5 py-0.5 text-white",
                resolvedWinner === m.player2 && !isTie
                  ? "bg-success"
                  : "bg-secondary",
              )}
            >
              {m.score2}
            </span>
          </div>
        </div>
        <div className="mt-2 text-sm text-foreground-muted">{summary}</div>
      </div>
    </div>
  );
}

export default function Tourney4BracketGroupedPage() {
  const [active, setActive] = useState<"b1" | "b2" | "playoffs">("b1");
  const [search, setSearch] = useState("");
  const [modalMatch, setModalMatch] = useState<MatchJSON | null>(null);

  const { b1, b2, playoffs } = useMemo(() => {
    const b1 = (matchesData as MatchJSON[])
      .filter((m) => m.bracket === "Bracket 1")
      .sort((a, b) => a.match - b.match);
    const b2 = (matchesData as MatchJSON[])
      .filter((m) => m.bracket === "Bracket 2")
      .sort((a, b) => a.match - b.match);
    const playoffs = (matchesData as MatchJSON[])
      .filter((m) => m.bracket === "Playoffs")
      .sort((a, b) => a.match - b.match);
    return { b1, b2, playoffs };
  }, []);

  function filter(list: MatchJSON[]) {
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter(
      (m) =>
        m.player1.toLowerCase().includes(term) ||
        m.player2.toLowerCase().includes(term) ||
        `${m.match}`.includes(term) ||
        m.bracket.toLowerCase().includes(term),
    );
  }

  const stageList = active === "b1" ? b1 : active === "b2" ? b2 : playoffs;
  const filtered = filter(stageList);

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 4", href: "/phasmotourney-series/phasmotourney4" },
    { label: "Brackets & Playoffs" },
  ]);

  const tabs = [
    { key: "b1" as const, label: `Bracket 1 (${b1.length})` },
    { key: "b2" as const, label: `Bracket 2 (${b2.length})` },
    { key: "playoffs" as const, label: `Playoffs (${playoffs.length})` },
  ];

  return (
    <TourneyPage
      title="Phasmo Tourney 4"
      subtitle="Browse the full bracket archive, including both pools and the playoff gauntlet."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Archive" }, { label: "Bracket" }]}
      containerProps={{ className: "py-3" }}
      extraHeader={
        <div className="text-foreground-muted text-sm">
          Static import from the 2023 sheet. Results kept for historical
          reference.
        </div>
      }
    >
      <h2 className="text-xl font-semibold mb-3">Brackets & Playoffs</h2>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground dark:text-foreground-dark placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Search players, match #, stage..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search matches"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border dark:border-border-dark mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors -mb-px",
              active === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-foreground-muted hover:text-foreground dark:hover:text-foreground-dark",
            )}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {filtered.map((m) => (
          <StaticMatchCard
            key={`${m.bracket}-${m.match}`}
            m={m}
            onClick={() => setModalMatch(m)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-foreground-muted italic">No matches found.</div>
        )}
      </div>

      {/* Modal */}
      {modalMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setModalMatch(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Dialog */}
          <div
            className="relative z-10 w-full max-w-md mx-4 rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
              <h3 className="text-base font-semibold">
                Match {modalMatch.match} – {modalMatch.player1} vs{" "}
                {modalMatch.player2}
              </h3>
              <button
                className="text-foreground-muted hover:text-foreground dark:hover:text-foreground-dark transition-colors text-xl leading-none"
                onClick={() => setModalMatch(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="px-4 py-3">
              <p className="mb-1">
                <strong>Bracket:</strong> {modalMatch.bracket}
              </p>
              <p className="mb-1">
                <strong>Scoreline:</strong> {modalMatch.player1}{" "}
                {modalMatch.score1} – {modalMatch.score2} {modalMatch.player2}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {modalMatch.score1 === modalMatch.score2 &&
                  !modalMatch.winner && (
                    <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-800 text-white">
                      Tie
                    </span>
                  )}
                {modalMatch.winner && (
                  <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-success text-white">
                    Winner: {modalMatch.winner}
                  </span>
                )}
                {modalMatch.winner &&
                  modalMatch.match === 10 &&
                  modalMatch.bracket === "Playoffs" && (
                    <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-warning text-gray-900">
                      Champion
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </TourneyPage>
  );
}
