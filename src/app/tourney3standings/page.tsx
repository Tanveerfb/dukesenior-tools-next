"use client";
import { useEffect, useState } from 'react';
import { Alert, Container, Table } from 'react-bootstrap';
import { getStandingsT3 } from '@/lib/services/phasmoTourney3';

export default function Tourney3StandingsPage(){
  const [list,setList] = useState<any[]>([]);
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{ const d = await getStandingsT3(); setList(d); setReady(true); })();},[]);
  return (
    <Container>
      <h2 className="mt-3">Phasmo Tourney 3 Standings</h2>
      <Alert variant="warning">Negative number = eliminated team</Alert>
      <Table striped hover responsive>
        <thead><tr><th>Rank</th><th>Team</th><th>Member 1</th><th>Member 2</th><th>Total points</th></tr></thead>
        <tbody>
          {ready && list.map((item,idx)=>(
            <tr key={idx}>
              <td>{idx+1}</td>
              <td>{item.teamID}</td>
              <td>{item.player1}</td>
              <td>{item.player2}</td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
