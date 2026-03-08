"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
  immune: boolean;
}

interface RoundSettings {
  roundId: string;
  roundName?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export default function Tourney5WhatsNextPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [roundSettings, setRoundSettings] = useState<RoundSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Load players to show immune status
        const playersRes = await fetch("/api/admin/phasmoTourney5/players");
        const p = await playersRes.json();
        setPlayers(Array.isArray(p) ? p : []);

        // Try to load upcoming round settings (you can change roundId based on current state)
        // For now, we'll try to fetch round1 settings as an example
        try {
          const settingsRes = await fetch(
            "/api/phasmoTourney5/rounds/round1/settings",
          );
          if (settingsRes.ok) {
            const settings = await settingsRes.json();
            setRoundSettings(settings);
          }
        } catch {
          // Settings not available yet
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3 text-foreground">
          Phasmo Tourney 5 — What&apos;s Next?
        </h1>
        <div className="text-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-primary-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-3 text-foreground">
          Phasmo Tourney 5 — What&apos;s Next?
        </h1>
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-3 text-red-800 dark:text-red-200">
          {error}
        </div>
      </div>
    );
  }

  const activePlayers = players.filter((p) => p.status === "Active");
  const immunePlayers = activePlayers.filter((p) => p.immune);
  const vulnerablePlayers = activePlayers.filter((p) => !p.immune);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-lg font-semibold mb-3 text-foreground">
        Phasmo Tourney 5 — What&apos;s Next?
      </h1>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-4">
          <h2 className="text-base font-semibold mb-3 text-foreground">
            Current Tournament Status
          </h2>
          <div className="flex flex-col gap-2">
            <div className="text-foreground">
              <strong>Active Players:</strong>{" "}
              <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary-500 text-white">
                {activePlayers.length}
              </span>
            </div>
            <div className="text-foreground">
              <strong>Immune Players:</strong>{" "}
              <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {immunePlayers.length}
              </span>
            </div>
            <div className="text-foreground">
              <strong>Vulnerable Players:</strong>{" "}
              <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                {vulnerablePlayers.length}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-4">
          <h2 className="text-base font-semibold mb-3 text-foreground">
            Immune Players
          </h2>
          {immunePlayers.length === 0 ? (
            <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-3 text-blue-800 dark:text-blue-200 text-sm">
              No players are currently immune.
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {immunePlayers.map((player) => (
                <span
                  key={player.id}
                  className="rounded-full text-sm font-medium px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                >
                  {player.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-4">
          <h2 className="text-base font-semibold mb-3 text-foreground">
            Upcoming Round
          </h2>
          {roundSettings ? (
            <div className="flex flex-col gap-2 text-foreground">
              {roundSettings.roundName && (
                <div>
                  <strong>Round:</strong> {roundSettings.roundName}
                </div>
              )}
              {roundSettings.startDate && (
                <div>
                  <strong>Start Date:</strong> {roundSettings.startDate}
                </div>
              )}
              {roundSettings.endDate && (
                <div>
                  <strong>End Date:</strong> {roundSettings.endDate}
                </div>
              )}
              {roundSettings.description && (
                <div className="mt-2">
                  <strong>Description:</strong>
                  <p className="mt-1 mb-0">{roundSettings.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-3 text-blue-800 dark:text-blue-200 text-sm">
              Upcoming round details will be announced soon. Stay tuned!
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm p-4">
          <h2 className="text-base font-semibold mb-3 text-foreground">
            What to Expect
          </h2>
          <div className="rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 p-3 text-gray-700 dark:text-gray-300 text-sm">
            <p className="mb-2">
              The next round will feature challenges, eliminations, and voting
              sessions. Watch for:
            </p>
            <ul className="list-disc list-inside mb-0 space-y-1">
              <li>Eliminator challenges where players face off</li>
              <li>Voting sessions to determine eliminations</li>
              <li>Immunity assignments for top performers</li>
              <li>Recorded runs with detailed scoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
