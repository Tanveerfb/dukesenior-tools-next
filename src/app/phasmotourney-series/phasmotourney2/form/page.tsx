"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { tourney2DataExport } from "@/lib/services/phasmoTourney2";
import { useAuth } from "@/hooks/useAuth";

export default function PhasmoTourney2FormPage() {
  const { user } = useAuth();
  const officer = useRef<HTMLInputElement>(null);
  const username = useRef<HTMLInputElement>(null);
  const phasmomap = useRef<HTMLSelectElement>(null);
  const ghostpicture = useRef<HTMLInputElement>(null);
  const bonepicture = useRef<HTMLInputElement>(null);
  const objective1 = useRef<HTMLInputElement>(null);
  const objective2 = useRef<HTMLInputElement>(null);
  const objective3 = useRef<HTMLInputElement>(null);
  const notes = useRef<HTMLTextAreaElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);
  const [survived, setSurvived] = useState(true);
  const [correctGhost, setCorrectGhost] = useState(true);
  const [perfectGame, setPerfectGame] = useState(true);
  const [resultScreen, setResultScreen] = useState(false);
  const [marks, setMarks] = useState(0);

  function toggleSurvival() {
    setSurvived((s) => !s);
  }
  function toggleCorrectGhost() {
    setCorrectGhost((c) => !c);
  }
  function togglePerfectGame() {
    setPerfectGame((p) => !p);
  }

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    let m = 0;
    if (ghostpicture.current?.checked) m += 3;
    if (bonepicture.current?.checked) m += 2;
    if (objective1.current?.checked) m += 1;
    if (objective2.current?.checked) m += 1;
    if (objective3.current?.checked) m += 1;
    m += survived ? 5 : -2;
    if (correctGhost) m += 5;
    if (perfectGame) m += 2;
    setMarks(m);

    await tourney2DataExport(
      officer.current?.value || "",
      username.current?.value || "",
      phasmomap.current?.value || "",
      !!ghostpicture.current?.checked,
      !!bonepicture.current?.checked,
      !!objective1.current?.checked,
      !!objective2.current?.checked,
      !!objective3.current?.checked,
      survived,
      correctGhost,
      perfectGame,
      minutesRef.current?.value || "00",
      secondsRef.current?.value || "00",
      notes.current?.value || "",
    );

    setResultScreen(true);
  }
  function reset() {
    setMarks(0);
    setSurvived(true);
    setCorrectGhost(true);
    setPerfectGame(true);
    setResultScreen(false);
  }

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 2", href: "/phasmotourney-series/phasmotourney2" },
    { label: "Submission Form" },
  ]);

  return (
    <TourneyPage
      title="Phasmo Tourney 2 Submission"
      subtitle="Officer-only intake form for recording official round results into the archive."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 2" }, { label: "Admin Tool" }]}
      containerProps={{ className: "py-4" }}
    >
      {resultScreen ? (
        <div className="p-2 flex flex-col items-center">
          <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 text-center">
            Congratulations! You got {marks} marks.
          </div>
          <button
            onClick={reset}
            className="mt-3 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            Another run?
          </button>
        </div>
      ) : (
        <form className="p-3 mx-auto" onSubmit={calculate}>
          <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 text-center mb-4">
            DukeSenior&apos;s Phasmo Tourney #2 (2024)
          </div>
          <div className="mb-3">
            <label className="block text-foreground font-medium mb-1">
              Name of the person filling this form
            </label>
            <input
              ref={officer}
              defaultValue={user?.displayName || ""}
              disabled={!user?.displayName}
              required
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2 disabled:opacity-60"
            />
          </div>
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 px-4 py-3 text-center mb-4">
            During the investigation :
          </div>
          <div className="mb-3">
            <label className="block text-foreground font-medium mb-1">
              Player name / Twitch username
            </label>
            <input
              type="text"
              maxLength={30}
              ref={username}
              required
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
            />
          </div>
          <div className="mb-3">
            <select
              aria-label="phasmo-map"
              ref={phasmomap}
              required
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
            >
              <option value="">Phasmophobia map</option>
              <option value="10 Ridgeview Court">10 Ridgeview Court</option>
              <option value="Grafton Farmhouse">Grafton Farmhouse</option>
              <option value="Willow Street">Willow Street</option>
              <option value="Sunny Meadows Restricted">
                Sunny Meadows Restricted
              </option>
              <option value="SCB Special">SCB Special</option>
            </select>
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        ref={ghostpicture}
                        className="sr-only peer"
                      />
                      <span className="relative w-9 h-5 bg-gray-300 peer-checked:bg-primary-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                      Ghost picture
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        ref={bonepicture}
                        className="sr-only peer"
                      />
                      <span className="relative w-9 h-5 bg-gray-300 peer-checked:bg-primary-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                      Bone picture
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        ref={objective1}
                        className="sr-only peer"
                      />
                      <span className="relative w-9 h-5 bg-gray-300 peer-checked:bg-primary-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                      Objective 1
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        ref={objective2}
                        className="sr-only peer"
                      />
                      <span className="relative w-9 h-5 bg-gray-300 peer-checked:bg-primary-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                      Objective 2
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        ref={objective3}
                        className="sr-only peer"
                      />
                      <span className="relative w-9 h-5 bg-gray-300 peer-checked:bg-primary-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                      Objective 3
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 px-4 py-3 text-center mb-4">
            Post investigation summary :
          </div>
          <div className="mb-1">
            <div className="flex">
              <button
                type="button"
                disabled={survived}
                onClick={toggleSurvival}
                className={cn(
                  "flex-1 m-1 px-4 py-2 rounded-lg font-medium transition-colors",
                  survived
                    ? "bg-primary-500 text-white cursor-default"
                    : "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
                )}
              >
                Survived
              </button>
              <button
                type="button"
                disabled={!survived}
                onClick={toggleSurvival}
                className={cn(
                  "flex-1 m-1 px-4 py-2 rounded-lg font-medium transition-colors",
                  !survived
                    ? "bg-red-600 text-white cursor-default"
                    : "border border-red-600 text-red-600 hover:bg-red-600/10",
                )}
              >
                Died
              </button>
            </div>
          </div>
          <div className="mb-1">
            <div className="flex">
              <button
                type="button"
                disabled={correctGhost}
                onClick={toggleCorrectGhost}
                className={cn(
                  "flex-1 m-1 px-4 py-2 rounded-lg font-medium transition-colors",
                  correctGhost
                    ? "bg-primary-500 text-white cursor-default"
                    : "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
                )}
              >
                Correct ghost type
              </button>
              <button
                type="button"
                disabled={!correctGhost}
                onClick={toggleCorrectGhost}
                className={cn(
                  "flex-1 m-1 px-4 py-2 rounded-lg font-medium transition-colors",
                  !correctGhost
                    ? "bg-red-600 text-white cursor-default"
                    : "border border-red-600 text-red-600 hover:bg-red-600/10",
                )}
              >
                Incorrect type
              </button>
            </div>
          </div>
          <div className="mb-1">
            <div className="flex">
              <button
                type="button"
                disabled={perfectGame}
                onClick={togglePerfectGame}
                className={cn(
                  "flex-1 m-1 px-4 py-2 rounded-lg font-medium transition-colors",
                  perfectGame
                    ? "bg-primary-500 text-white cursor-default"
                    : "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
                )}
              >
                Perfect game
              </button>
              <button
                type="button"
                disabled={!perfectGame}
                onClick={togglePerfectGame}
                className={cn(
                  "flex-1 m-1 px-4 py-2 rounded-lg font-medium transition-colors",
                  !perfectGame
                    ? "bg-red-600 text-white cursor-default"
                    : "border border-red-600 text-red-600 hover:bg-red-600/10",
                )}
              >
                Normal game
              </button>
            </div>
          </div>
          <div className="mb-1">
            <label className="block text-foreground font-medium mb-1">
              Total time investigating :
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Minutes"
                maxLength={2}
                min={0}
                max={99}
                ref={minutesRef}
                required
                className="flex-1 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
              />
              <input
                type="number"
                placeholder="Seconds"
                maxLength={2}
                min={0}
                max={59}
                ref={secondsRef}
                required
                className="flex-1 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
              />
            </div>
          </div>
          <div className="flex flex-col mb-3">
            <label className="text-foreground font-medium mb-1">
              Additional notes:
            </label>
            <textarea
              className="mb-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
              rows={4}
              placeholder="Type details of the run."
              ref={notes}
            />
            <button
              type="submit"
              className="m-1 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium"
            >
              Submit and check
            </button>
          </div>
        </form>
      )}
    </TourneyPage>
  );
}
