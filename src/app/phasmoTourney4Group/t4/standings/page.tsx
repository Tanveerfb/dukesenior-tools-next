"use client";
import { useEffect, useState } from 'react';
import { Alert, Badge, Container, Tab, Table, Tabs } from 'react-bootstrap';
import { getBracketStandings } from '@/lib/services/phasmoTourney4';

export default function Tourney4GroupedStandingsPage(){
  const [b1,setB1] = useState<any[]>([]);
  const [b2,setB2] = useState<any[]>([]);
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{ const snap1 = await getBracketStandings(1); const list1:any[]=[]; snap1.forEach(b=> list1.push([b.data()])); const snap2 = await getBracketStandings(2); const list2:any[]=[]; snap2.forEach(b=> list2.push([b.data()])); setB1(list1); setB2(list2); setReady(true); })();},[]);
  return (
    <Container>
      {ready && (
        <>
          <Alert variant="secondary" className="fw-bolder">Top 4 from each bracket will advance to playoffs</Alert>
          <Container className="p-2 d-flex justify-content-between align-items-center">
            <span><Badge bg="success">W</Badge> - Win</span>
            <span><Badge bg="danger">L</Badge> - Loss</span>
            <span><Badge bg="dark">T</Badge> - Tie</span>
            <span><Badge bg="primary">N</Badge> - Not Available</span>
          </Container>
          <Tabs defaultActiveKey="1" className="mb-3 p-2" fill>
            <Tab eventKey="1" title="Bracket 1">
              <Table responsive striped hover>
                <thead><tr><th>Rank</th><th>Name</th><th>W</th><th>L</th><th>T</th><th>Points</th><th>Last 3 matches</th></tr></thead>
                <tbody>
                  {b1.map((b,idx)=>{ const mh = b[0].matchHistory || []; const codes = [mh[mh.length-1], mh[mh.length-2], mh[mh.length-3]]; return (
                    <tr key={idx}>
                      <td>{idx+1}</td><td>{b[0].name}</td><td>{b[0].wins}</td><td>{b[0].losses}</td><td>{b[0].ties}</td><td className="fw-bold">{b[0].points}</td>
                      <td className="d-flex justify-content-center align-items-center gap-1">
                        {codes.map((c,i)=>{ const letter = c?.substring(0,1) || 'N';
                          const variant = letter==='W' ? 'success' : letter==='L' ? 'danger' : letter==='T' ? 'secondary' : 'dark';
                          return <Badge key={i} bg={variant} className="px-2 py-1 small" style={{minWidth:24, textAlign:'center'}}>{letter}</Badge>;
                        })}
                      </td>
                    </tr>); })}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="2" title="Bracket 2">
              <Table responsive striped hover>
                <thead><tr><th>Rank</th><th>Name</th><th>W</th><th>L</th><th>T</th><th>Points</th><th>Last 3 matches</th></tr></thead>
                <tbody>
                  {b2.map((b,idx)=>{ const mh = b[0].matchHistory || []; const codes = [mh[mh.length-1], mh[mh.length-2], mh[mh.length-3]]; return (
                    <tr key={idx}>
                      <td>{idx+1}</td><td>{b[0].name}</td><td>{b[0].wins}</td><td>{b[0].losses}</td><td>{b[0].ties}</td><td className="fw-bold">{b[0].points}</td>
                      <td className="d-flex justify-content-center align-items-center gap-1">
                        {codes.map((c,i)=>{ const letter = c?.substring(0,1) || 'N';
                          const variant = letter==='W' ? 'success' : letter==='L' ? 'danger' : letter==='T' ? 'secondary' : 'dark';
                          return <Badge key={i} bg={variant} className="px-2 py-1 small" style={{minWidth:24, textAlign:'center'}}>{letter}</Badge>;
                        })}
                      </td>
                    </tr>); })}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
}
