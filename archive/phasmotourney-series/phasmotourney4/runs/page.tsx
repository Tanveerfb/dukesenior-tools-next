"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getPhasmoTourney4Data } from "@/lib/services/phasmoTourney4";
import { cn } from "@/lib/utils";

export default function Tourney4GroupedRecordedRunsPage() {
  const [data, setData] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    (async () => {
      const snap = await getPhasmoTourney4Data();
      const list: any[] = [];
      snap.forEach((r) => list.push([r.data(), r.id]));
      setData(list);
      setReady(true);
    })();
  }, []);

  const filtered = data.filter(
    (r) =>
      r[0]?.Participant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r[0]?.CursedItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r[0]?.Evidences?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r[1]?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageData = filtered.slice(startIndex, startIndex + itemsPerPage);

  function handlePageChange(p: number) {
    setCurrentPage(p);
  }

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 4", href: "/phasmotourney-series/phasmotourney4" },
    { label: "Recorded Runs" },
  ]);

  return (
    <TourneyPage
      title="Recorded Runs"
      subtitle="Official submissions from Phasmo Tourney 4, straight from the Firebase archive."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 4" }, { label: "Runs" }]}
      containerProps={{ className: "py-4" }}
    >
      <div className="p-2 bg-info-50 dark:bg-info/10 rounded-lg font-bold mb-3">
        <input
          type="text"
          className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground dark:text-foreground-dark placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Search runs (e.g. player name, cursed items, match ID)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      {ready ? (
        <>
          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-1 my-2 flex-wrap">
              <button
                className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button
                className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  className={cn(
                    "px-3 py-1 text-sm rounded border transition-colors",
                    i + 1 === currentPage
                      ? "bg-primary text-white border-primary"
                      : "border-border dark:border-border-dark hover:bg-surface-100 dark:hover:bg-surface-800",
                  )}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
              <button
                className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark disabled:opacity-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </nav>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-border dark:border-border-dark text-foreground-muted">
                <tr>
                  <th className="px-3 py-2">Player Name</th>
                  <th className="px-3 py-2">Cursed Item</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Run ID</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {pageData.map((r, i) => {
                  let variantClass = "";
                  if (r[0]?.CursedItem === "Summoning Circle")
                    variantClass = "text-danger";
                  else if (r[0]?.CursedItem === "Ouija Board")
                    variantClass = "text-success";
                  else if (r[0]?.CursedItem === "Music Box")
                    variantClass = "text-info";
                  else if (r[0]?.CursedItem === "Haunted Mirror")
                    variantClass = "text-primary";
                  return (
                    <tr
                      key={r[1]}
                      className={cn(
                        "hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors",
                        i % 2 === 0 && "bg-surface-50 dark:bg-surface-900/40",
                      )}
                    >
                      <td className="px-3 py-2 font-bold">
                        {r[0]?.Participant}
                      </td>
                      <td className={cn("px-3 py-2 font-bold", variantClass)}>
                        {r[0]?.CursedItem}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(r[0]?.TimeSubmitted).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-foreground-muted">
                        {r[1]}
                      </td>
                      <td className="px-3 py-2">
                        {r[1] && (
                          <Link
                            className="text-warning hover:underline"
                            href={`/phasmotourney-series/phasmotourney4/runs/${r[1]}`}
                          >
                            Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-info/30 bg-info-50 dark:bg-info/10 px-4 py-3 text-info-600 dark:text-info">
          Data is not ready
        </div>
      )}
    </TourneyPage>
  );
}
