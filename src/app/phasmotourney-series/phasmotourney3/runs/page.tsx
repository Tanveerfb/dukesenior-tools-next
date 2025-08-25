"use client";
import { useEffect, useState } from 'react';
import { Alert, Container, Table } from 'react-bootstrap';
import Link from 'next/link';
import { getPhasmoTourney3Data } from '@/lib/services/phasmoTourney3';

export default function T3RecordedRunsPage(){
  const [data,setData] = useState<any[]>([]);
  const [ready,setReady] = useState(false);
  async function fetchData(){
    const snap = await getPhasmoTourney3Data();
    const list:any[] = [];
    snap.forEach(r=> list.push([r.data(), r.id]));
    setData(list); setReady(true);
  }
  useEffect(()=>{fetchData();},[]);
  return (
    <Container fluid="lg" className="mb-3 text-center">
      <h2 className="mt-3">Phasmo Tourney #3 Recorded Runs</h2>
      {ready ? (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Round</th>
              <th>Date Recorded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(r => {
              const originalId = r[1];
              const slug = originalId.replace(/\s+/g,'_');
              return (
                <tr key={originalId}>
                  <td>{r[0]?.Participant}</td>
                  <td>{r[0]?.Round}{r[0]?.Redemption ? ' Redemption' : ''}</td>
                  <td>{new Date(r[0]?.TimeSubmitted).toDateString()}</td>
                  <td>{originalId && <Link className="text-warning" href={`/phasmotourney-series/phasmotourney3/runs/${slug}`}>Details</Link>}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : <Alert>Data is not ready</Alert>}
    </Container>
  );
}
