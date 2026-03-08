"use client";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { tourneyDataExport } from "@/lib/services/phasmoTourney1";

export default function PhasmoTourney1FormPage() {
  const officer = useRef<HTMLSelectElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const username = useRef<HTMLInputElement>(null);
  const phasmomap = useRef<HTMLSelectElement>(null);
  const ghostpicture = useRef<HTMLInputElement>(null);
  const bonepicture = useRef<HTMLInputElement>(null);
  const curseditemuse = useRef<HTMLInputElement>(null);
  const objective1 = useRef<HTMLInputElement>(null);
  const objective2 = useRef<HTMLInputElement>(null);
  const objective3 = useRef<HTMLInputElement>(null);
  const notes = useRef<HTMLTextAreaElement>(null);
  const stars = useRef<HTMLSelectElement>(null);
  const [survived, setSurvived] = useState(true);
  const [error, setError] = useState("");
  const [correctGhost, setCorrectGhost] = useState(true);
  const [resultScreen, setResultScreen] = useState(false);
  const [marks, setMarks] = useState(0);

  function toggleSurvival() {
    setSurvived((s) => !s);
  }
  function toggleCorrectGhost() {
    setCorrectGhost((c) => !c);
  }

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    let m = 0;
    if (ghostpicture.current?.checked) m += 5;
    if (bonepicture.current?.checked) m += 1;
    if (curseditemuse.current?.checked) m += 1;
    if (objective1.current?.checked) m += 1;
    if (objective2.current?.checked) m += 1;
    if (objective3.current?.checked) m += 1;
    if (stars.current?.value === "30 stars (Criteria met)") m += 5;
    else if (stars.current?.value === "20-29 stars or criteria not met") m += 2;
    else if (stars.current?.value === "Less than 20 stars") m += 1;
    m += survived ? 5 : -2;
    if (correctGhost) m += 5;
    setMarks(m);

    if (password.current?.value === "1234") {
      await tourneyDataExport(
        officer.current!.value,
        username.current!.value,
        phasmomap.current!.value,
        !!ghostpicture.current?.checked,
        !!bonepicture.current?.checked,
        !!curseditemuse.current?.checked,
        !!objective1.current?.checked,
        !!objective2.current?.checked,
        !!objective3.current?.checked,
        stars.current!.value,
        survived,
        correctGhost,
        notes.current?.value || "",
      );
      setResultScreen(true);
    } else {
      setError(
        "{Officer access only}. Type in the correct password and try again.",
      );
    }
  }
  function reset() {
    setMarks(0);
    setSurvived(true);
    setCorrectGhost(true);
    setResultScreen(false);
    setError("");
  }

  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 1" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 1 Submission"
      subtitle="Legacy form used by officers to log official runs. Data writes directly to the Firestore archive."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 1" }, { label: "Admin Tool" }]}
      containerProps={{ className: "py-4" }}
    >
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 px-4 py-3 text-center">
          {error}
        </div>
      )}
      {resultScreen ? (
        <div className="p-2 flex flex-col">
          <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 text-center">
            Congratulations! You got {marks} marks.
          </div>
          <button
            onClick={reset}
            className="self-center mt-3 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            Another run?
          </button>
        </div>
      ) : (
        <form className="p-3 mx-auto" onSubmit={calculate}>
          <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 text-center mb-4">
            Phasmo Tourney #1 (2024)
          </div>
          <div className="mb-3">
            <select
              className="w-full text-center rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
              ref={officer}
              required
            >
              <option>Select officer completing this form </option>
              <option value="dukesenior">@DukeSenior</option>
              <option value="phoenixsamaowo">@Phoenixsamaowo</option>
            </select>
            <div className="flex mt-2">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border dark:border-border-dark bg-gray-100 dark:bg-gray-800 text-foreground-secondary text-sm">
                Password for officer
              </span>
              <input
                type="password"
                required
                ref={password}
                className="flex-1 rounded-r-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
              />
            </div>
          </div>
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 px-4 py-3 text-center mb-4">
            During the investigation :
          </div>
          <div className="mb-3 flex flex-col md:flex-row gap-2">
            <label className="text-foreground font-medium">Twitch.tv/</label>
            <input
              type="text"
              maxLength={30}
              ref={username}
              required
              className="flex-1 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
            />
          </div>
          <div className="mb-3">
            <select
              aria-label="phasmo-map"
              ref={phasmomap}
              required
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
            >
              <option>Phasmophobia map</option>
              <option value="10 Ridgeview Court">10 Ridgeview Court</option>
              <option value="42 Edgefield Road">42 Edgefield Road</option>
              <option value="Grafton Farmhouse">Grafton Farmhouse</option>
              <option value="Bleasdale Farmhouse">Bleasdale Farmhouse</option>
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
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
                      <input
                        type="checkbox"
                        ref={curseditemuse}
                        className="sr-only peer"
                      />
                      <span className="relative w-9 h-5 bg-gray-300 peer-checked:bg-primary-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                      Cursed item use
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
          <div className="mb-3">
            <label className="block text-foreground font-medium mb-1">
              Photos:{" "}
            </label>
            <select
              className="w-full my-1 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
              aria-label="photos-stars"
              ref={stars}
              required
            >
              <option>Total stars for pictures</option>
              <option value="30 stars (Criteria met)">
                30 stars (Must have ghost and bone picture)
              </option>
              <option value="20-29 stars or criteria not met">
                20-29 stars (select if ghost/bone picture not taken)
              </option>
              <option value="Less than 20 stars">Less than 20 stars</option>
            </select>
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
                    ? "bg-green-600 text-white cursor-default"
                    : "border border-green-600 text-green-600 hover:bg-green-600/10",
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
                    ? "bg-blue-600 text-white cursor-default"
                    : "border border-blue-600 text-blue-600 hover:bg-blue-600/10",
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
                    ? "bg-green-600 text-white cursor-default"
                    : "border border-green-600 text-green-600 hover:bg-green-600/10",
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
                    ? "bg-blue-600 text-white cursor-default"
                    : "border border-blue-600 text-blue-600 hover:bg-blue-600/10",
                )}
              >
                Incorrect type
              </button>
            </div>
          </div>
          <div className="flex flex-col mb-3">
            <label className="text-foreground font-medium mb-1">
              Additional notes:{" "}
            </label>
            <textarea
              className="mb-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2"
              rows={4}
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
