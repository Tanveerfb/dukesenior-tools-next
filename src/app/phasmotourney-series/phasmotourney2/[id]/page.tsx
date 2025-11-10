"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Alert, Button, Table } from "react-bootstrap";
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
    [id]
  );

  if (!data) {
    return (
      <TourneyPage
        title={`Run ${id}`}
        subtitle="Detailed breakdown of the selected submission."
        breadcrumbs={breadcrumbs}
        badges={[{ label: "Phasmo Tourney 2" }, { label: "Runs" }]}
        containerProps={{ fluid: "lg", className: "py-4" }}
      >
        <Alert>Loading / Not found</Alert>
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
      containerProps={{ fluid: "lg", className: "py-4" }}
    >
      <Alert
        variant="primary"
        className="d-flex flex-column flex-md-row justify-content-around align-items-center"
      >
        <div className="fw-semibold">Document - {id}</div>
        <Button
          as={InlineLink as any}
          href="/phasmotourney-series/phasmotourney2/records"
          variant="outline-secondary"
        >
          Go back
        </Button>
      </Alert>
      <Table hover responsive>
        <thead>
          <tr>
            <th>Score name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Officer name</td>
            <td>{data.Officer}</td>
          </tr>
          <tr>
            <td>Participant Twitch username</td>
            <td>{data.Participant}</td>
          </tr>
          <tr>
            <td>Map Played</td>
            <td>{data.Map}</td>
          </tr>
          <tr>
            <td>Ghost picture [+3]</td>
            <td>{String(!!data.GhostPictureTaken)}</td>
          </tr>
          <tr>
            <td>Bone Picture [+2]</td>
            <td>{String(!!data.BonePictureTaken)}</td>
          </tr>
          <tr>
            <td>Objective 1 [+1]</td>
            <td>{String(!!data.Objective1)}</td>
          </tr>
          <tr>
            <td>Objective 2 [+1]</td>
            <td>{String(!!data.Objective2)}</td>
          </tr>
          <tr>
            <td>Objective 3 [+1]</td>
            <td>{String(!!data.Objective3)}</td>
          </tr>
          <tr>
            <td>Survived [+5]</td>
            <td>{String(!!data.Survived)}</td>
          </tr>
          <tr>
            <td>Correct Ghost type? [+5]</td>
            <td>{String(!!data.CorrectGhostType)}</td>
          </tr>
          <tr>
            <td>Perfect game? [+2]</td>
            <td>{String(!!data.PerfectGame)}</td>
          </tr>
          <tr>
            <td>Additional notes</td>
            <td>{data.AdditionalNotes || "N/A"}</td>
          </tr>
          <tr>
            <td>
              <b>Total score</b>
            </td>
            <td>
              <b>{showMarks ? marks : "N/A"}</b>
            </td>
          </tr>
        </tbody>
      </Table>
    </TourneyPage>
  );
}
