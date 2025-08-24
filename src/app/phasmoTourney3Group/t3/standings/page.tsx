"use client";
import { useEffect, useState } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';
import { getStandingsT3 } from '@/lib/services/phasmoTourney3';

export default function T3StandingsPage(){
  const [rows,setRows] = useState<any[]>([]);
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{ const list = await getStandingsT3(); setRows(list); setReady(true); })();},[]);
  return (
    <Container fluid="lg" className="py-3">
      <h2 className="mb-3">Tourney 3 Standings</h2>
      {ready ? (
        <Table striped hover responsive size="sm">
          <thead><tr><th>#</th><th>Team</th><th>Scores</th><th>Total</th></tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.teamID||i}>
                <td>{i+1}</td>
                <td>{r.player1} & {r.player2}</td>
                <td>{(r.scores||[]).join(', ')}</td>
                <td><b>{r.total||0}</b></td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : <Alert>Loading standings...</Alert>}
    </Container>
  );
}
