"use client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import InlineLink from "@/components/ui/InlineLink";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getPhasmoTourney4Document } from "@/lib/services/phasmoTourney4";

export default function Tourney4RunDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<any | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const doc = await getPhasmoTourney4Document(id);
      setData(doc || null);
      setReady(true);
    })();
  }, [id]);

  const breadcrumbs = useMemo(
    () =>
      buildTourneyBreadcrumbs([
        {
          label: "Phasmo Tourney 4",
          href: "/phasmotourney-series/phasmotourney4",
        },
        {
          label: "Recorded Runs",
          href: "/phasmotourney-series/phasmotourney4/runs",
        },
        { label: `Run ${id ?? "…"}` },
      ]),
    [id]
  );

  const subtitle = data?.Participant
    ? `${data.Participant} • ${new Date(data.TimeSubmitted).toLocaleString()}`
    : "Review every datapoint logged for this submission.";

  return (
    <TourneyPage
      title={`Run ${id ?? "…"}`}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 4" }, { label: "Runs" }]}
      actions={[
        {
          label: "Back to runs",
          href: "/phasmotourney-series/phasmotourney4/runs",
          variant: "outline-light",
        },
      ]}
      containerProps={{ fluid: "lg", className: "py-4" }}
    >
      <Alert
        variant="primary"
        className="d-flex flex-wrap align-items-center gap-2"
      >
        <div className="fw-semibold">Submission snapshot</div>
        {data?.Officer && (
          <div className="text-muted small">Officer: {data.Officer}</div>
        )}
        <div className="ms-auto small">
          Run ID: <span className="fw-semibold text-warning">{id}</span>
        </div>
      </Alert>
      {ready && data ? (
        <Table hover responsive striped>
          <thead>
            <tr>
              <th>Score name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Document ID</td>
              <td className="text-warning fw-bold">{id}</td>
            </tr>
            <tr>
              <td>Officer name</td>
              <td>{data.Officer}</td>
            </tr>
            <tr>
              <td>Player name</td>
              <td>{data.Participant}</td>
            </tr>
            <tr>
              <td>Cursed Item</td>
              <td>{data.CursedItem}</td>
            </tr>
            <tr>
              <td>Cursed Item Used?</td>
              <td>{data.CursedItemUse ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Evidence number</td>
              <td>{data.Evidences}</td>
            </tr>
            <tr>
              <td>Ghost picture [+3]</td>
              <td>{data.GhostPictureTaken ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Bone Picture [+2]</td>
              <td>{data.BonePictureTaken ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Objective 1 [+2]</td>
              <td>{data.Objective1 ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Objective 2 [+2]</td>
              <td>{data.Objective2 ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Objective 3 [+2]</td>
              <td>{data.Objective3 ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Survived [+2/-2]</td>
              <td>{data.Survived ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Correct Ghost type? [+5]</td>
              <td>{data.CorrectGhostType ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Perfect game? [+2]</td>
              <td>{data.PerfectGame ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>Additional notes</td>
              <td>
                {data.AdditionalNotes === "" ? "N/A" : data.AdditionalNotes}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Total score</strong>
              </td>
              <td>
                <strong>{data.Marks}</strong>
              </td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <Alert variant="primary" className="text-center">
          Loading or missing data
        </Alert>
      )}
      <div className="pt-3">
        <Button
          as={InlineLink as any}
          href="/phasmotourney-series/phasmotourney4/runs"
          variant="outline-secondary"
        >
          Back to all runs
        </Button>
      </div>
    </TourneyPage>
  );
}
