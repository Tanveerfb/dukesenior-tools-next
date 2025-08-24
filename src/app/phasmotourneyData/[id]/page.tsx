"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Alert, Container, Table } from "react-bootstrap";
import { getPhasmoTourneyDocument } from "@/lib/services/phasmoTourney1";

export default function PhasmoTourney1DetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    async function run() {
      if (!id) return;
      const d = await getPhasmoTourneyDocument(id);
      setData(d || null);
    }
    run();
  }, [id]);

  if (!data) return <Container className="py-4"><Alert>Loading / Not found</Alert></Container>;

  return (
    <Container className="py-4">
      <h3>Run Details</h3>
      <Table bordered responsive size="sm">
        <tbody>
          {Object.entries(data).map(([k, v]) => (
            <tr key={k}><th>{k}</th><td>{String(v)}</td></tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
