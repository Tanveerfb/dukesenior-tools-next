"use client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getPhasmoTourney4Document } from "@/lib/services/phasmoTourney4";
import { cn } from "@/lib/utils";

export default function Tourney4RunDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<any | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const doc = await getPhasmoTourney4Document(id);
      setData(doc || null);
      setReady(true);
    })();
  }, [id]);

  const breadcrumbs = useMemo(
    () =>
      buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 4",
          href: "/phasmotourney-series/phasmotourney4",
        },
        {
          label: "Recorded Runs",
          href: "/phasmotourney-series/phasmotourney4/runs",
        },
        { label: `Run ${id ?? "…"}` },
      ]),
    [id],
  );

  const subtitle = data?.Participant
    ? `${data.Participant} • ${new Date(data.TimeSubmitted).toLocaleString()}`
    : "Review every datapoint logged for this submission.";

  const rows = data
    ? [
        [
          "Document ID",
          <span key="id" className="text-warning font-bold">
            {id}
          </span>,
        ],
        ["Officer name", data.Officer],
        ["Player name", data.Participant],
        ["Cursed Item", data.CursedItem],
        ["Cursed Item Used?", data.CursedItemUse ? "Yes" : "No"],
        ["Evidence number", data.Evidences],
        ["Ghost picture [+3]", data.GhostPictureTaken ? "Yes" : "No"],
        ["Bone Picture [+2]", data.BonePictureTaken ? "Yes" : "No"],
        ["Objective 1 [+2]", data.Objective1 ? "Yes" : "No"],
        ["Objective 2 [+2]", data.Objective2 ? "Yes" : "No"],
        ["Objective 3 [+2]", data.Objective3 ? "Yes" : "No"],
        ["Survived [+2/-2]", data.Survived ? "Yes" : "No"],
        ["Correct Ghost type? [+5]", data.CorrectGhostType ? "Yes" : "No"],
        ["Perfect game? [+2]", data.PerfectGame ? "Yes" : "No"],
        [
          "Additional notes",
          data.AdditionalNotes === "" ? "N/A" : data.AdditionalNotes,
        ],
        [
          <strong key="ts">Total score</strong>,
          <strong key="tv">{data.Marks}</strong>,
        ],
      ]
    : [];

  return (
    <TourneyPage
      title={`Run ${id ?? "…"}`}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 4" }, { label: "Runs" }]}
      actions={[
        {
          label: "Back to runs",
          href: "/phasmotourney-series/phasmotourney4/runs",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-4" }}
    >
      {/* Info alert */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary-50 dark:bg-primary/10 px-4 py-3 mb-4">
        <div className="font-semibold">Submission snapshot</div>
        {data?.Officer && (
          <div className="text-foreground-muted text-sm">
            Officer: {data.Officer}
          </div>
        )}
        <div className="ml-auto text-sm">
          Run ID: <span className="font-semibold text-warning">{id}</span>
        </div>
      </div>

      {ready && data ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border dark:border-border-dark text-foreground-muted">
              <tr>
                <th className="px-3 py-2">Score name</th>
                <th className="px-3 py-2">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    "hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors",
                    i % 2 === 0 && "bg-surface-50 dark:bg-surface-900/40",
                  )}
                >
                  <td className="px-3 py-2">{row[0]}</td>
                  <td className="px-3 py-2">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-primary/30 bg-primary-50 dark:bg-primary/10 px-4 py-3 text-center text-primary-700 dark:text-primary">
          Loading or missing data
        </div>
      )}

      <div className="pt-3">
        <Link
          href="/phasmotourney-series/phasmotourney4/runs"
          className="inline-block px-4 py-2 text-sm rounded-lg border border-border dark:border-border-dark hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          Back to all runs
        </Link>
      </div>
    </TourneyPage>
  );
}
