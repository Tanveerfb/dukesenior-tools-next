"use client";
import { useEffect, useState } from 'react';
import { Col, Container, Row, Table, Alert } from 'react-bootstrap';
import { getMostRuns, getAvgRuns, getCurrentStreakStandings, getBestStreakStandings } from '@/lib/services/phasmoTourney4';

export default function Tourney4StatsPage(){
  const [mostRuns,setMostRuns] = useState<any[]>([]);
  const [avgRuns,setAvgRuns] = useState<any[]>([]);
  const [currentStreak,setCurrentStreak] = useState<any[]>([]);
  const [bestStreak,setBestStreak] = useState<any[]>([]);
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{ setMostRuns(await getMostRuns()); setAvgRuns(await getAvgRuns()); setCurrentStreak(await getCurrentStreakStandings()); setBestStreak(await getBestStreakStandings()); setReady(true); })();},[]);
  function StatsTable({title,data,cols}:{title:string;data:any[];cols:{k:string;label:string}[]}){
    return (
      <div className="mb-4">
        <h5>{title}</h5>
        <Table size="sm" bordered hover responsive>
          <thead><tr>{cols.map(c=> <th key={c.k}>{c.label}</th>)}</tr></thead>
          <tbody>
            {data.map((d,i)=>(<tr key={i}>{cols.map(c=> <td key={c.k}>{d[c.k]}</td>)}</tr>))}
          </tbody>
        </Table>
      </div>
    );
  }
  return (
    <Container>
      <h2 className="mt-3">Tourney 4 Stats</h2>
      {ready ? (
        <Row className="g-4">
          <Col xs={12} md={6}><StatsTable title="Most Runs (Total Score)" data={mostRuns} cols={[{k:'name',label:'Player'},{k:'totalScore',label:'Total Score'}]} /></Col>
          <Col xs={12} md={6}><StatsTable title="Average Score" data={avgRuns} cols={[{k:'name',label:'Player'},{k:'avgScore',label:'Avg Score'}]} /></Col>
          <Col xs={12} md={6}><StatsTable title="Current Streak" data={currentStreak} cols={[{k:'name',label:'Player'},{k:'streak',label:'Streak'}]} /></Col>
          <Col xs={12} md={6}><StatsTable title="Best Streak" data={bestStreak} cols={[{k:'name',label:'Player'},{k:'bestStreak',label:'Best'}]} /></Col>
        </Row>
      ) : <Alert>Loading stats...</Alert>}
    </Container>
  );
}
