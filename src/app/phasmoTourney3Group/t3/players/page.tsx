"use client";
import { useEffect, useState } from 'react';
import { Container, Table, Alert, Badge } from 'react-bootstrap';
import { getStandingsT3 } from '@/lib/services/phasmoTourney3';

// Display each team once with combined player names and total points.
export default function T3PlayersPage(){
  const [teams,setTeams] = useState<{teamLabel:string; total:number; teamID?:string; members:string; eliminated:boolean}[]>([]);
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{
    const standings:any[] = await getStandingsT3();
    const teamList = standings.map(t => {
      const members = [t.player1, t.player2].filter(Boolean).join(' & ') || 'Unknown';
      const total = typeof t.total === 'number' ? t.total : 0;
      const eliminated = total < 0; // convention noted by user
      return {
        teamLabel: t.teamID ? `Team ${t.teamID}` : (t.teamName || 'Team'),
        total,
        teamID: t.teamID,
        members,
        eliminated
      };
    });
    // Sort by total descending (higher first); negative totals automatically fall to bottom
    teamList.sort((a,b)=> b.total - a.total || (a.teamID||'').localeCompare(b.teamID||''));
    setTeams(teamList); setReady(true);
  })();},[]);
  return (
    <Container fluid="lg" className="py-3">
      <h2 className="mb-3">Tourney 3 Teams</h2>
      {ready ? (
        <Table striped hover responsive size="sm">
          <thead><tr><th>Rank</th><th>Team</th><th>Members</th><th>Total Points</th><th>Status</th></tr></thead>
          <tbody>
            {teams.map((t,i)=>(
              <tr key={t.teamLabel + i} className={t.eliminated? 'opacity-75':''}>
                <td>{t.total >= 0 ? i+1 : '-'}</td>
                <td>{t.teamLabel}</td>
                <td>{t.members}</td>
                <td><Badge bg={t.eliminated? 'secondary':'primary'}>{t.total}</Badge></td>
                <td>{t.eliminated ? <Badge bg="danger">Eliminated</Badge> : <Badge bg="success">Active</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : <Alert>Loading teams...</Alert>}
      <p className="text-muted small mt-2">Negative totals (if present) indicate eliminated teams per historical convention.</p>
    </Container>
  );
}
