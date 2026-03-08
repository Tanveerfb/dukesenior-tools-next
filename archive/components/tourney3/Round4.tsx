"use client";

export default function Round4() {
  return (
    <div className="max-w-7xl mx-auto px-4 p-2 mb-3">
      {/* Alert */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 p-3 mb-3 text-foreground">
        Finals [3 teams]
      </div>

      <div className="max-w-7xl mx-auto px-4 p-2 flex flex-col md:flex-row items-center">
        <div className="max-w-7xl mx-auto px-4 p-2 flex flex-row md:flex-col">
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center mb-2 p-1">
            <div className="font-bold bg-primary-500 text-white px-4 py-2 rounded-t-xl">
              Finals
            </div>
            <div className="p-4">
              <ul className="divide-y divide-border dark:divide-border-dark">
                <li className="py-2 px-3">
                  Match 14 :{" "}
                  <span className="font-bold text-dendro">Team 2 </span>
                  <span className="font-bold">&nbsp;vs&nbsp;</span>
                  <span>Team 5</span>
                </li>
                <li className="py-2 px-3">
                  Match 15 :{" "}
                  <span className="font-bold text-dendro">Team 1 </span>
                  <span className="font-bold">&nbsp;vs&nbsp;</span>
                  <span>Team 5</span>
                </li>
                <li className="py-2 px-3">
                  Match 16 : <span>Team 1</span>
                  <span className="font-bold">&nbsp;vs&nbsp;</span>
                  <span className="font-bold text-dendro">Team 2 </span>
                </li>
              </ul>
            </div>
            <div className="border-t border-border dark:border-border-dark px-4 py-3">
              <p>
                <b>Map : </b>
                <span className="font-extrabold text-cyan-500">
                  Sunny Meadows Mental Institution (Restricted)
                </span>
              </p>
              <div className="rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 p-3 mt-2 text-foreground-secondary text-sm">
                The <span className="font-bold text-green-600">Winner</span> of
                the tournament was decided in this round!
              </div>
              <span className="text-dendro font-bold"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
