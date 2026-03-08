"use client";
import BracketMatchInfo from "./BracketMatchInfo";

export default function Round2() {
  return (
    <div className="max-w-7xl mx-auto px-4 p-2 mb-3">
      {/* Alert */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 p-3 mb-3 text-foreground">
        Round 2 [6 teams]
      </div>

      <div className="max-w-7xl mx-auto px-4 p-2 flex flex-col md:flex-row items-center">
        {/* Main Bracket */}
        <div className="max-w-7xl mx-auto px-4 p-2 flex flex-row md:flex-col">
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center mb-2 p-1">
            <div className="font-bold bg-primary-500 text-white px-4 py-2 rounded-t-xl">
              Round 2
            </div>
            <div className="p-4">
              <ul className="divide-y divide-border dark:divide-border-dark">
                <li className="py-2 px-3">
                  Match 7 :{" "}
                  <BracketMatchInfo
                    team1="Team 1"
                    team2="Team 4"
                    roundnumber={2}
                  />
                </li>
                <li className="py-2 px-3">
                  Match 8 :{" "}
                  <BracketMatchInfo
                    team1="Team 2"
                    team2="Team 6"
                    roundnumber={2}
                  />
                </li>
                <li className="py-2 px-3">
                  Match 9 :{" "}
                  <BracketMatchInfo
                    team1="Team 3"
                    team2="Team 5"
                    roundnumber={2}
                  />
                </li>
              </ul>
            </div>
            <div className="border-t border-border dark:border-border-dark px-4 py-3">
              <p>
                <b>Map : </b>
                <span className="font-extrabold text-cyan-500">
                  13 Willow Street
                </span>
              </p>
              <div className="rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 p-3 mt-2 text-foreground-secondary text-sm">
                3 Eliminated teams can choose to grab another fighting chance in
                Redemption Bracket
              </div>
            </div>
          </div>
        </div>

        {/* Redemption Bracket */}
        <div className="max-w-7xl mx-auto px-4 p-2 flex flex-row md:flex-col">
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center mb-2 p-1">
            <div className="font-bold bg-red-600 text-white px-4 py-2 rounded-t-xl">
              Round 2 - Redemption Bracket
            </div>
            <div className="p-4">
              <ul className="divide-y divide-border dark:divide-border-dark">
                <li className="py-2 px-3">
                  Match 10 : <span>Team 3[32/50] </span> <b>vs</b>{" "}
                  <span>Team 4[45/50] </span> <b>vs</b>{" "}
                  <span className="text-dendro font-bold">Team 6[48/50] </span>
                </li>
              </ul>
            </div>
            <div className="border-t border-border dark:border-border-dark px-4 py-3">
              <p>
                <b>Map : </b>
                <span className="font-extrabold text-cyan-500">
                  6 Tanglewood Drive
                </span>
              </p>
              <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 p-3 mt-2 text-foreground text-sm">
                Teams will do 2 runs each. The total from those 2 runs will be
                compared against other teams to get the winner of the redemption
                bracket.
              </div>
              <div className="rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 p-3 mt-2 text-foreground-secondary text-sm">
                2 teams will be eliminated in this Redemption Bracket
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
