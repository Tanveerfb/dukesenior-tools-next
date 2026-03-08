"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getPhasmoTourney4Document } from "../../../../../lib/services/phasmoTourney4";

export default function Tourney4RunDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      if (!id) return;
      const d = await getPhasmoTourney4Document(id);
      setData(d || null);
      setReady(true);
    })();
  }, [id]);
  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="rounded-lg border border-primary-500 bg-primary-500/10 dark:bg-primary-500/20 p-3 flex flex-row justify-between items-center gap-2 mb-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Go back
        </button>
        <span className="p-1 text-center text-foreground">
          <b>{data?.Participant}</b>&apos;s run recorded on <br />
          <b>
            {data?.TimeSubmitted ? new Date(data.TimeSubmitted).toString() : ""}
          </b>
        </span>
      </div>
      {ready && data ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="py-2 pr-4 font-semibold text-foreground">
                  Score name
                </th>
                <th className="py-2 font-semibold text-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Document ID</td>
                <td className="py-2 text-yellow-500 font-bold">{id}</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Officer name</td>
                <td className="py-2 text-foreground">{data.Officer}</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Player name</td>
                <td className="py-2 text-foreground">{data.Participant}</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Cursed Item</td>
                <td className="py-2 text-foreground">{data.CursedItem}</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Cursed Item Used?</td>
                <td className="py-2 text-foreground">
                  {data.CursedItemUse ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Evidence number</td>
                <td className="py-2 text-foreground">{data.Evidences}</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">
                  Ghost picture [+3]
                </td>
                <td className="py-2 text-foreground">
                  {data.GhostPictureTaken ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Bone Picture [+2]</td>
                <td className="py-2 text-foreground">
                  {data.BonePictureTaken ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Objective 1 [+2]</td>
                <td className="py-2 text-foreground">
                  {data.Objective1 ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Objective 2 [+2]</td>
                <td className="py-2 text-foreground">
                  {data.Objective2 ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Objective 3 [+2]</td>
                <td className="py-2 text-foreground">
                  {data.Objective3 ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Survived [+2/-2]</td>
                <td className="py-2 text-foreground">
                  {data.Survived ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">
                  Correct Ghost type? [+5]
                </td>
                <td className="py-2 text-foreground">
                  {data.CorrectGhostType ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">
                  Perfect game? [+2]
                </td>
                <td className="py-2 text-foreground">
                  {data.PerfectGame ? "Yes" : "No"}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 text-foreground">Additional notes</td>
                <td className="py-2 text-foreground">
                  {data.AdditionalNotes === "" ? "N/A" : data.AdditionalNotes}
                </td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 even:bg-gray-50/50 dark:even:bg-gray-800/30">
                <td className="py-2 pr-4 font-bold text-foreground">
                  Total score
                </td>
                <td className="py-2 font-bold text-foreground">{data.Marks}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-primary-500 bg-primary-500/10 dark:bg-primary-500/20 p-3 text-center text-foreground">
          Loading or missing data
        </div>
      )}
    </div>
  );
}
