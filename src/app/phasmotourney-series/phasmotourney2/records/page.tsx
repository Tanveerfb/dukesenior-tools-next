"use client";
import { useEffect, useState } from 'react';
import { Alert, Button, Container, Table } from 'react-bootstrap';
import Link from 'next/link';
import { getPhasmoTourney2Data } from '@/lib/services/phasmoTourney2';

export default function PhasmoTourney2RecordsPage() {
  const [data, setData] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  async function fetchData() {
    const snap = await getPhasmoTourney2Data();
    const list: any[] = [];
    snap.forEach(r => list.push([r.data(), r.id]));
    setData(list);
    setReady(true);
  }
  useEffect(() => { fetchData(); }, []);

  return (
    <Container fluid="lg" className="mb-3">
      {ready ? (
        <Table hover responsive>
          <thead>
            <tr>
              <th>Participant Name</th>
              <th>Officer name</th>
              <th>Map name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(r => {
              const twitchlink = `https://www.twitch.tv/${r[0]?.Participant}`;
              return (
                <tr key={r[1]}>
                  <td>
                    <Button variant="primary" className="text-white">
                      <Link className="text-white text-decoration-none" href={twitchlink} target="_blank">{r[0]?.Participant}</Link>
                    </Button>
                  </td>
                  <td>{r[0]?.Officer}</td>
                  <td>{r[0]?.Map}</td>
                  <td>{r[1] && <Link href={`/phasmotourney-series/phasmotourney2/${r[1]}`}>Details</Link>}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : <Alert>Data is not ready</Alert>}
    </Container>
  );
}
