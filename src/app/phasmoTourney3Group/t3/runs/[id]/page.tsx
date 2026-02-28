"use client";
// Unified route: /phasmotourney-series/phasmotourney3/runs lists runs, /phasmotourney-series/phasmotourney3/runs/[id] shows a run.
// This page renders run details (extracted from previous /run/[id] implementation).
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  getPhasmoTourney3Document,
  getPhasmoTourney3Data,
} from "@/lib/services/phasmoTourney3";

export default function T3RunDetailsUnifiedPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { id } = params;
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const attemptFetch = useCallback(async (runID: string) => {
    setLoading(true);
    setNotFound(false);
    setSuggestions([]);
    try {
      if (!runID) return;
      const doc = await getPhasmoTourney3Document(runID);
      if (doc) {
        setData(doc);
        return;
      }
      const snap = await getPhasmoTourney3Data();
      const allIDs: string[] = [];
      snap.forEach((d) => allIDs.push(d.id));
      const parts = runID.split("-");
      const ts = parts[0];
      const normalized = (s: string) => s.replace(/\s+/g, "").toLowerCase();
      const maybeTeam = parts.slice(1, parts.length - 1).join("-");
      const maybeRound = parts[parts.length - 1];
      const matches = allIDs
        .filter((idv) => {
          if (idv === runID) return true;
          const pr = idv.split("-");
          if (pr.length < 3) return false;
          const its = pr[0];
          const team = pr.slice(1, pr.length - 1).join("-");
          const round = pr[pr.length - 1];
          const tsMatch = its === ts;
          const teamMatch = normalized(team) === normalized(maybeTeam);
          const roundMatch = normalized(round) === normalized(maybeRound);
          return (
            (tsMatch && (teamMatch || roundMatch)) || (teamMatch && roundMatch)
          );
        })
        .slice(0, 10);
      setSuggestions(matches);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolvedId = typeof id === "string" ? id.replace(/_/g, " ") : id;
  useEffect(() => {
    attemptFetch(resolvedId);
  }, [resolvedId, attemptFetch]);

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="rounded-lg border border-primary-500 bg-primary-500/10 dark:bg-primary-500/20 p-3 flex flex-row justify-between items-center flex-wrap gap-2 mb-4">
        <button
          onClick={() =>
            router.push("/phasmotourney-series/phasmotourney3/runs")
          }
          className="px-4 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-500 transition-colors"
        >
          Back to runs
        </button>
      </div>
      {loading && (
        <div className="text-center my-10">
          <svg
            className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-2"
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
          <span className="text-foreground">Loading run…</span>
        </div>
      )}
      {!loading && data && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="py-2 pr-4 font-semibold text-foreground">
                  Score name
                </th>
                <th className="py-2 font-semibold text-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">Officer name</td>
                <td className="py-2 text-foreground">{data.Officer}</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">Team</td>
                <td className="py-2 text-foreground">{data.Participant}</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">Round Played</td>
                <td className="py-2 text-foreground">
                  {data.Round}
                  {data.Redemption ? " Redemption" : ""}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">
                  Ghost picture [+3]
                </td>
                <td className="py-2 text-foreground">
                  {data.GhostPictureTaken ? "true" : "false"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">Bone Picture [+2]</td>
                <td className="py-2 text-foreground">
                  {data.BonePictureTaken ? "true" : "false"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">Objective 1 [+2]</td>
                <td className="py-2 text-foreground">
                  {data.Objective1 ? "true" : "false"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">Objective 2 [+2]</td>
                <td className="py-2 text-foreground">
                  {data.Objective2 ? "true" : "false"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">Objective 3 [+2]</td>
                <td className="py-2 text-foreground">
                  {data.Objective3 ? "true" : "false"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">
                  Survived [+5/+2/-5]
                </td>
                <td className="py-2 text-foreground">
                  {String(data.Survived)}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">
                  Correct Ghost type? [+5]
                </td>
                <td className="py-2 text-foreground">
                  {data.CorrectGhostType ? "true" : "false"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">
                  Perfect game? [+2]
                </td>
                <td className="py-2 text-foreground">
                  {data.PerfectGame ? "true" : "false"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">
                  Time Criteria? [+2/+1/0]
                </td>
                <td className="py-2 text-foreground">{data.Time}</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 text-foreground">Additional notes</td>
                <td className="py-2 text-foreground">
                  {data.AdditionalNotes === "" ? "N/A" : data.AdditionalNotes}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-4 font-bold text-foreground">
                  Total score
                </td>
                <td className="py-2 font-bold text-foreground">{data.Marks}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {!loading && notFound && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-3 text-yellow-800 dark:text-yellow-200 mt-3">
          <div className="font-bold mb-1">Run not found</div>
          We couldn&apos;t locate a document with the ID{" "}
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
            {resolvedId}
          </code>
          .
          {suggestions.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold mb-1">Closest matches:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="text-sm px-3 py-1 rounded-lg border border-border dark:border-border-dark text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() =>
                      router.replace(
                        `/phasmotourney-series/phasmotourney3/runs/${encodeURIComponent(s.replace(/\s+/g, "_"))}`,
                      )
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
