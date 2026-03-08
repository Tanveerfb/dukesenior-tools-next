"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getPhasmoTourney2Document } from "@/lib/services/phasmoTourney2";

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

  const breadcrumbs = useMemo(
    () =>
      buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 2",
          href: "/phasmotourney-series/phasmotourney2",
        },
        {
          label: "Recorded Runs",
          href: "/phasmotourney-series/phasmotourney2/records",
        },
        { label: `Run ${id}` },
      ]),
    [id],
  );

  if (!data) {
    return (
      <TourneyPage
        title={`Run ${id}`}
        subtitle="Detailed breakdown of the selected submission."
        breadcrumbs={breadcrumbs}
        badges={[{ label: "Phasmo Tourney 2" }, { label: "Runs" }]}
        containerProps={{ className: "py-4" }}
      >
        <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3">
          Loading / Not found
        </div>
      </TourneyPage>
    );
  }

  return (
    <TourneyPage
      title={`Run ${id}`}
      subtitle={`${data.Participant} • ${data.Map}`}
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 2" }, { label: "Runs" }]}
      actions={[
        {
          label: "Back to records",
          href: "/phasmotourney-series/phasmotourney2/records",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-4" }}
    >
      <div className="rounded-lg border border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-4 py-3 flex flex-col md:flex-row justify-around items-center mb-4">
        <div className="font-semibold">Document - {id}</div>
        <InlineLink
          href="/phasmotourney-series/phasmotourney2/records"
          className="mt-2 md:mt-0 px-4 py-1.5 rounded-lg border border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
        >
          Go back
        </InlineLink>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border dark:border-border-dark">
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                Score name
              </th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Officer name</td>
              <td className="px-3 py-2 text-foreground">{data.Officer}</td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">
                Participant Twitch username
              </td>
              <td className="px-3 py-2 text-foreground">{data.Participant}</td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Map Played</td>
              <td className="px-3 py-2 text-foreground">{data.Map}</td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Ghost picture [+3]</td>
              <td className="px-3 py-2 text-foreground">
                {String(!!data.GhostPictureTaken)}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Bone Picture [+2]</td>
              <td className="px-3 py-2 text-foreground">
                {String(!!data.BonePictureTaken)}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Objective 1 [+1]</td>
              <td className="px-3 py-2 text-foreground">
                {String(!!data.Objective1)}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Objective 2 [+1]</td>
              <td className="px-3 py-2 text-foreground">
                {String(!!data.Objective2)}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Objective 3 [+1]</td>
              <td className="px-3 py-2 text-foreground">
                {String(!!data.Objective3)}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Survived [+5]</td>
              <td className="px-3 py-2 text-foreground">
                {String(!!data.Survived)}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">
                Correct Ghost type? [+5]
              </td>
              <td className="px-3 py-2 text-foreground">
                {String(!!data.CorrectGhostType)}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Perfect game? [+2]</td>
              <td className="px-3 py-2 text-foreground">
                {String(!!data.PerfectGame)}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground">Additional notes</td>
              <td className="px-3 py-2 text-foreground">
                {data.AdditionalNotes || "N/A"}
              </td>
            </tr>
            <tr className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-3 py-2 text-foreground font-bold">
                Total score
              </td>
              <td className="px-3 py-2 text-foreground font-bold">
                {showMarks ? marks : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </TourneyPage>
  );
}
