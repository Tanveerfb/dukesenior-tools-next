"use client";
import { Tabs, Tab, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { getPlayersList } from '@/lib/services/phasmoTourney4';

export default function Tourney4BracketPage(){
  const [players,setPlayers] = useState<any[]>([]);
  useEffect(()=>{(async()=>{ const list = await getPlayersList(); setPlayers(list); })();},[]);
  return (
    <div>
      <h2 className="mt-3">Tourney 4 Brackets & Playoffs</h2>
      <Tabs defaultActiveKey="b1" className="mb-3">
        <Tab eventKey="b1" title="Bracket 1">
          <p>Players (Bracket 1)</p>
          <ul>{players[1]?.[0]?.map((p:string)=>(<li key={p}>{p}</li>))}</ul>
        </Tab>
        <Tab eventKey="b2" title="Bracket 2">
          <p>Players (Bracket 2)</p>
          <ul>{players[2]?.[0]?.map((p:string)=>(<li key={p}>{p}</li>))}</ul>
        </Tab>
        <Tab eventKey="playoffs" title="Playoffs">
          <p>Playoff bracket placeholder (migration minimal version)</p>
        </Tab>
      </Tabs>
    </div>
  );
}
