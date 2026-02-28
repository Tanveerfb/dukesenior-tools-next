"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPhasmoTourney4Data } from "@/lib/services/phasmoTourney4";

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

  const cursedItemColor = (item: string) => {
    if (item === "Summoning Circle") return "text-orange-500";
    if (item === "Ouija Board") return "text-yellow-600 dark:text-yellow-400";
    if (item === "Music Box") return "text-blue-500";
    if (item === "Haunted Mirror") return "text-teal-500";
    return "";
  };

  return (
    <div className="w-full px-4">
      <h2 className="mt-3 text-xl font-semibold text-foreground">
        Phasmo Tourney #4 Recorded Runs
      </h2>
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-2 mb-2">
        <input
          type="text"
          placeholder="Search runs (e.g. player name, cursed items, match ID)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {ready ? (
        <>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 my-2 flex-wrap">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground transition-colors"
              >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground transition-colors"
              >
                &lsaquo;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={cn(
                    "px-3 py-1 text-sm rounded border transition-colors",
                    i + 1 === currentPage
                      ? "bg-primary-500 text-white border-primary-500"
                      : "border-border dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground",
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground transition-colors"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm rounded border border-border dark:border-border-dark disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground transition-colors"
              >
                &raquo;
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="py-2 pr-4 font-semibold text-foreground">
                    Player Name
                  </th>
                  <th className="py-2 pr-4 font-semibold text-foreground">
                    Cursed Item
                  </th>
                  <th className="py-2 pr-4 font-semibold text-foreground">
                    Time
                  </th>
                  <th className="py-2 pr-4 font-semibold text-foreground">
                    Run ID
                  </th>
                  <th className="py-2 font-semibold text-foreground">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((r) => (
                  <tr
                    key={r[1]}
                    className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30"
                  >
                    <td className="py-2 pr-4 font-bold text-foreground">
                      {r[0]?.Participant}
                    </td>
                    <td
                      className={cn(
                        "py-2 pr-4 font-bold",
                        cursedItemColor(r[0]?.CursedItem),
                      )}
                    >
                      {r[0]?.CursedItem}
                    </td>
                    <td className="py-2 pr-4 text-foreground">
                      {new Date(r[0]?.TimeSubmitted).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{r[1]}</td>
                    <td className="py-2">
                      {r[1] && (
                        <Link
                          className="text-yellow-500 hover:underline"
                          href={`/phasmotourney-series/phasmotourney4/runs/${r[1]}`}
                        >
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-3 text-blue-800 dark:text-blue-200 mt-3">
          Data is not ready
        </div>
      )}
    </div>
  );
}
