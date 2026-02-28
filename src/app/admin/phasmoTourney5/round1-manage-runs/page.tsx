"use client";

export default function Round1ManageRunsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-3">
        Round 1 — Manage Runs (Admin)
      </h1>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold">Host Selections</h2>
          <div className="mt-2 rounded-xl border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-3">
            TODO: Configure map, settings, and score system for Round 1.
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold">Wildcard Choices</h2>
          <div className="mt-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800/30 dark:text-gray-300 px-4 py-3">
            TODO: Define N wildcards (N = number of players). Lower prestige
            players can go first to pick a wildcard or skip to default
            randomness. Once a wildcard is selected, remove it from the list.
          </div>
          <button
            disabled
            className="mt-3 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            TODO: Start Wildcard Selection Order
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold">Record Run Details</h2>
          <div className="mt-2 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-4 py-3">
            TODO: Admin form for entering each player&apos;s run details (map,
            settings reference, per-score sheet totals, notes). Persist and
            compute standings.
          </div>
          <ul className="mt-3 divide-y divide-border dark:divide-border-dark rounded-xl border border-border dark:border-border-dark overflow-hidden">
            <li className="px-4 py-3 text-gray-500">
              TODO: Runs list (player, score, time)
            </li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="p-4">
          <h2 className="text-base font-semibold">Post-Round Actions</h2>
          <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/20 dark:text-gray-300 px-4 py-3">
            TODO: After results are confirmed, mark Top 2 as Immune; open
            Vote-Out session for remaining players; enable optional
            Comeback/Eliminator pairing setup.
          </div>
        </div>
      </div>
    </div>
  );
}
