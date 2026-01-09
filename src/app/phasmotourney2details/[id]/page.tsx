"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Button, Container, Table } from 'react-bootstrap';
import Link from 'next/link';
import { getPhasmoTourney2Document } from '../../../lib/services/phasmoTourney2';

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
      if (d.Survived) m += 5; else m -= 3;
      if (d.CorrectGhostType) m += 5;
      if (d.PerfectGame) m += 2;
      setMarks(m);
      setShowMarks(true);
    }
    fetch();
  }, [id]);

  if (!data) return <Container className="py-4"><Alert>Loading / Not found</Alert></Container>;

  return (
    <Container fluid="lg">
      <Alert variant="primary" className="d-flex flex-column flex-md-row justify-content-around align-items-center">
  <Button variant="tertiary" className="m-1 text-white"><Link className="text-white text-decoration-none" href="/phasmotourney-series/phasmotourney2/records">Go back</Link></Button>
        <Button className="m-1" disabled>Document - {id}</Button>
      </Alert>
      <Table hover responsive>
        <thead>
          <tr><th>Score name</th><th>Value</th></tr>
        </thead>
        <tbody>
          <tr><td>Officer name</td><td>{data.Officer}</td></tr>
          <tr><td>Participant Twitch username</td><td>{data.Participant}</td></tr>
            <tr><td>Map Played</td><td>{data.Map}</td></tr>
            <tr><td>Ghost picture [+3]</td><td>{String(!!data.GhostPictureTaken)}</td></tr>
            <tr><td>Bone Picture [+2]</td><td>{String(!!data.BonePictureTaken)}</td></tr>
            <tr><td>Objective 1 [+1]</td><td>{String(!!data.Objective1)}</td></tr>
            <tr><td>Objective 2 [+1]</td><td>{String(!!data.Objective2)}</td></tr>
            <tr><td>Objective 3 [+1]</td><td>{String(!!data.Objective3)}</td></tr>
            <tr><td>Survived [+5]</td><td>{String(!!data.Survived)}</td></tr>
            <tr><td>Correct Ghost type? [+5]</td><td>{String(!!data.CorrectGhostType)}</td></tr>
            <tr><td>Perfect game? [+2]</td><td>{String(!!data.PerfectGame)}</td></tr>
            <tr><td>Additional notes</td><td>{data.AdditionalNotes || 'N/A'}</td></tr>
            <tr><td><b>Total score</b></td><td><b>{showMarks ? marks : 'N/A'}</b></td></tr>
        </tbody>
      </Table>
    </Container>
  );
}

