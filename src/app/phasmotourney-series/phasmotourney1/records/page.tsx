"use client";
import { useEffect, useState } from 'react';
import { Alert, Container, Table } from 'react-bootstrap';
import Link from 'next/link';
import { getPhasmoTourneyData } from '@/lib/services/phasmoTourney1';

export default function PhasmoTourney1RecordsPage(){
  const [data,setData] = useState<any[]>([]);
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{ const snap = await getPhasmoTourneyData(); const list:any[]=[]; snap.forEach(r=> list.push([r.data(), r.id])); setData(list); setReady(true); })();},[]);

  return (
    <Container fluid className="py-3">
      <h2>Phasmo Tourney 1 - Recorded Runs</h2>
      {ready ? (
        <Table hover responsive>
          <thead><tr><th>Player</th><th>Map</th><th>Time</th><th>Run ID</th><th>Details</th></tr></thead>
          <tbody>
            {data.map(r=> (
              <tr key={r[1]}>
                <td>{r[0]?.Participant}</td>
                <td>{r[0]?.Map}</td>
                <td>{new Date(r[0]?.TimeSubmitted).toLocaleString()}</td>
                <td>{r[1]}</td>
                <td>{r[1] && <Link href={`/phasmotourney-series/phasmotourney1/records/${r[1]}`}>Details</Link>}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : <Alert>Data not ready</Alert>}
    </Container>
  );
}
