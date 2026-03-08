"use client";
import BracketMatchInfo from "./BracketMatchInfo";

export default function Round1() {
  return (
    <div className="max-w-7xl mx-auto px-4 p-2 mb-3">
      {/* Alert */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700 p-3 mb-3 text-foreground">
        Round 1 [8 Teams]
      </div>

      <div className="max-w-7xl mx-auto px-4 p-2 flex flex-col md:flex-row items-center">
        {/* Main Bracket */}
        <div className="max-w-7xl mx-auto px-4 p-2 flex flex-row md:flex-col">
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center mb-2 p-1">
            <div className="font-bold bg-primary-500 text-white px-4 py-2 rounded-t-xl">
              Round 1
            </div>
            <div className="p-4">
              <ul className="divide-y divide-border dark:divide-border-dark">
                <li className="py-2 px-3">
                  Match 1 :{" "}
                  <BracketMatchInfo
                    team1="Team 6"
                    team2="Team 2"
                    roundnumber={1}
                  />
                </li>
                <li className="py-2 px-3">
                  Match 2 :{" "}
                  <BracketMatchInfo
                    team1="Team 3"
                    team2="Team 5"
                    roundnumber={1}
                  />
                </li>
                <li className="py-2 px-3">
                  Match 3 :{" "}
                  <BracketMatchInfo
                    team1="Team 4"
                    team2="Team 7"
                    roundnumber={1}
                  />
                </li>
                <li className="py-2 px-3">
                  Match 4 :{" "}
                  <BracketMatchInfo
                    team1="Team 1"
                    team2="Team 8"
                    roundnumber={1}
                  />
                </li>
              </ul>
            </div>
            <div className="border-t border-border dark:border-border-dark px-4 py-3">
              <p>
                <b>Map : </b>
                <span className="font-extrabold text-cyan-500">
                  Grafton Farmhouse
                </span>
              </p>
              <div className="rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 p-3 mt-2 text-foreground-secondary text-sm">
                4 Eliminated teams can choose to grab another fighting chance in
                Redemption Bracket
              </div>
            </div>
          </div>
        </div>

        {/* Redemption Bracket */}
        <div className="max-w-7xl mx-auto px-4 p-2 flex flex-row md:flex-col">
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center mb-2 p-1">
            <div className="font-bold bg-red-600 text-white px-4 py-2 rounded-t-xl">
              Round 1 - Redemption Bracket
            </div>
            <div className="p-4">
              <ul className="divide-y divide-border dark:divide-border-dark">
                <li className="py-2 px-3">
                  Match 5 :{" "}
                  <BracketMatchInfo
                    team1="Team 6"
                    team2="Team 7"
                    roundnumber={1}
                    redemption
                  />
                </li>
                <li className="py-2 px-3">
                  Match 6 :{" "}
                  <BracketMatchInfo
                    team1="Team 5"
                    team2="Team 8"
                    roundnumber={1}
                    redemption
                  />
                </li>
              </ul>
            </div>
            <div className="border-t border-border dark:border-border-dark px-4 py-3">
              <p>
                <b>Map : </b>
                <span className="font-extrabold text-cyan-500">
                  10 Ridgeview Court
                </span>
              </p>
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
