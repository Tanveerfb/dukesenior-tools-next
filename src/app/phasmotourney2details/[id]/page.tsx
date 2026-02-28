"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPhasmoTourney2Document } from "../../../lib/services/phasmoTourney2";

export default function PhasmoTourney2RunDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any | null>(null);
  const [marks, setMarks] = useState(0);
  const [showMarks, setShowMarks] = useState(false);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      const d: any = await getPhasmoTourney2Document(id);
      if (!d) return;
      setData(d);
      let m = 0;
      if (d.GhostPictureTaken) m += 3;
      if (d.BonePictureTaken) m += 2;
      if (d.Objective1) m += 1;
      if (d.Objective2) m += 1;
      if (d.Objective3) m += 1;
      if (d.Survived) m += 5;
      else m -= 3;
      if (d.CorrectGhostType) m += 5;
      if (d.PerfectGame) m += 2;
      setMarks(m);
      setShowMarks(true);
    }
    fetch();
  }, [id]);

  if (!data)
    return (
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 p-3 text-blue-800 dark:text-blue-200">
          Loading / Not found
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="rounded-lg border border-primary-500 bg-primary-500/10 dark:bg-primary-500/20 p-3 flex flex-col md:flex-row justify-around items-center gap-2 mb-4">
        <Link
          href="/phasmotourney-series/phasmotourney2/records"
          className="px-4 py-2 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors"
        >
          Go back
        </Link>
        <span className="px-4 py-2 rounded-lg bg-primary-500 text-white opacity-75 cursor-default">
          Document - {id}
        </span>
      </div>
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
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Officer name</td>
              <td className="py-2 text-foreground">{data.Officer}</td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">
                Participant Twitch username
              </td>
              <td className="py-2 text-foreground">{data.Participant}</td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Map Played</td>
              <td className="py-2 text-foreground">{data.Map}</td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Ghost picture [+3]</td>
              <td className="py-2 text-foreground">
                {String(!!data.GhostPictureTaken)}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Bone Picture [+2]</td>
              <td className="py-2 text-foreground">
                {String(!!data.BonePictureTaken)}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Objective 1 [+1]</td>
              <td className="py-2 text-foreground">
                {String(!!data.Objective1)}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Objective 2 [+1]</td>
              <td className="py-2 text-foreground">
                {String(!!data.Objective2)}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Objective 3 [+1]</td>
              <td className="py-2 text-foreground">
                {String(!!data.Objective3)}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Survived [+5]</td>
              <td className="py-2 text-foreground">
                {String(!!data.Survived)}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">
                Correct Ghost type? [+5]
              </td>
              <td className="py-2 text-foreground">
                {String(!!data.CorrectGhostType)}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Perfect game? [+2]</td>
              <td className="py-2 text-foreground">
                {String(!!data.PerfectGame)}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 text-foreground">Additional notes</td>
              <td className="py-2 text-foreground">
                {data.AdditionalNotes || "N/A"}
              </td>
            </tr>
            <tr className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-2 pr-4 font-bold text-foreground">
                Total score
              </td>
              <td className="py-2 font-bold text-foreground">
                {showMarks ? marks : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
