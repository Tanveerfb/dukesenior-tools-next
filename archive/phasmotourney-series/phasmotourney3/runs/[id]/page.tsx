"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
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

  const breadcrumbs = useMemo(
    () =>
      buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 3",
          href: "/phasmotourney-series/phasmotourney3",
        },
        {
          label: "Recorded Runs",
          href: "/phasmotourney-series/phasmotourney3/runs",
        },
        { label: resolvedId },
      ]),
    [resolvedId],
  );

  return (
    <TourneyPage
      title={`Run ${resolvedId}`}
      subtitle="Deep dive record including objectives and tie-break fields."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 3" }, { label: "Runs" }]}
      actions={[
        {
          label: "Back to runs",
          href: "/phasmotourney-series/phasmotourney3/runs",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-4" }}
    >
      {loading && (
        <div className="text-center my-10">
          <svg
            className="animate-spin h-8 w-8 mx-auto text-primary"
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
          <span className="ml-2">Loading run…</span>
        </div>
      )}
      {!loading && data && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border dark:border-border-dark text-foreground-muted">
              <tr>
                <th className="px-3 py-2">Score name</th>
                <th className="px-3 py-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
                <td className="px-3 py-2">Officer name</td>
                <td className="px-3 py-2">{data.Officer}</td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors bg-surface-50 dark:bg-surface-900/40">
                <td className="px-3 py-2">Team</td>
                <td className="px-3 py-2">{data.Participant}</td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
                <td className="px-3 py-2">Round Played</td>
                <td className="px-3 py-2">
                  {data.Round}
                  {data.Redemption ? " Redemption" : ""}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors bg-surface-50 dark:bg-surface-900/40">
                <td className="px-3 py-2">Ghost picture [+3]</td>
                <td className="px-3 py-2">
                  {data.GhostPictureTaken ? "true" : "false"}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
                <td className="px-3 py-2">Bone Picture [+2]</td>
                <td className="px-3 py-2">
                  {data.BonePictureTaken ? "true" : "false"}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors bg-surface-50 dark:bg-surface-900/40">
                <td className="px-3 py-2">Objective 1 [+2]</td>
                <td className="px-3 py-2">
                  {data.Objective1 ? "true" : "false"}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
                <td className="px-3 py-2">Objective 2 [+2]</td>
                <td className="px-3 py-2">
                  {data.Objective2 ? "true" : "false"}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors bg-surface-50 dark:bg-surface-900/40">
                <td className="px-3 py-2">Objective 3 [+2]</td>
                <td className="px-3 py-2">
                  {data.Objective3 ? "true" : "false"}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
                <td className="px-3 py-2">Survived [+5/+2/-5]</td>
                <td className="px-3 py-2">{String(data.Survived)}</td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors bg-surface-50 dark:bg-surface-900/40">
                <td className="px-3 py-2">Correct Ghost type? [+5]</td>
                <td className="px-3 py-2">
                  {data.CorrectGhostType ? "true" : "false"}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
                <td className="px-3 py-2">Perfect game? [+2]</td>
                <td className="px-3 py-2">
                  {data.PerfectGame ? "true" : "false"}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors bg-surface-50 dark:bg-surface-900/40">
                <td className="px-3 py-2">Time Criteria? [+2/+1/0]</td>
                <td className="px-3 py-2">{data.Time}</td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors">
                <td className="px-3 py-2">Additional notes</td>
                <td className="px-3 py-2">
                  {data.AdditionalNotes === "" ? "N/A" : data.AdditionalNotes}
                </td>
              </tr>
              <tr className="hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors bg-surface-50 dark:bg-surface-900/40">
                <td className="px-3 py-2">
                  <b>Total score</b>
                </td>
                <td className="px-3 py-2">
                  <b>{data.Marks}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {!loading && notFound && (
        <div className="mt-3 rounded-lg border border-warning/30 bg-warning-50 dark:bg-warning/10 px-4 py-3 text-warning-600 dark:text-warning">
          <div className="font-bold mb-1">Run not found</div>
          We couldn&apos;t locate a document with the ID{" "}
          <code className="text-sm bg-surface-200 dark:bg-surface-800 px-1 rounded">
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
                    className="text-sm px-3 py-1 rounded-lg border border-border dark:border-border-dark hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    onClick={() =>
                      router.replace(
                        `/phasmotourney-series/phasmotourney3/runs/${encodeURIComponent(
                          s.replace(/\s+/g, "_"),
                        )}`,
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
    </TourneyPage>
  );
}
