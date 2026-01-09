"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, Button, Container, Table } from 'react-bootstrap';
import { getPhasmoTourney4Document } from '../../../../../lib/services/phasmoTourney4';

export default function Tourney4RunDetailsPage(){
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const [data,setData] = useState<any|null>(null);
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{ if(!id) return; const d = await getPhasmoTourney4Document(id); setData(d||null); setReady(true); })();},[id]);
  return (
    <Container fluid="lg">
      <Alert variant="primary" className="d-flex flex-row justify-content-between align-items-center">
        <Button onClick={()=>router.back()}>Go back</Button>
        <span className="p-1 m-auto"><b>{data?.Participant}</b>'s run recorded on <br/><b>{data?.TimeSubmitted ? new Date(data.TimeSubmitted).toString(): ''}</b></span>
      </Alert>
      {ready && data ? (
        <Table hover responsive striped>
          <thead><tr><th>Score name</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Document ID</td><td className="text-warning fw-bold">{id}</td></tr>
            <tr><td>Officer name</td><td>{data.Officer}</td></tr>
            <tr><td>Player name</td><td>{data.Participant}</td></tr>
            <tr><td>Cursed Item</td><td>{data.CursedItem}</td></tr>
            <tr><td>Cursed Item Used?</td><td>{data.CursedItemUse ? 'Yes':'No'}</td></tr>
            <tr><td>Evidence number</td><td>{data.Evidences}</td></tr>
            <tr><td>Ghost picture [+3]</td><td>{data.GhostPictureTaken ? 'Yes':'No'}</td></tr>
            <tr><td>Bone Picture [+2]</td><td>{data.BonePictureTaken ? 'Yes':'No'}</td></tr>
            <tr><td>Objective 1 [+2]</td><td>{data.Objective1 ? 'Yes':'No'}</td></tr>
            <tr><td>Objective 2 [+2]</td><td>{data.Objective2 ? 'Yes':'No'}</td></tr>
            <tr><td>Objective 3 [+2]</td><td>{data.Objective3 ? 'Yes':'No'}</td></tr>
            <tr><td>Survived [+2/-2]</td><td>{data.Survived ? 'Yes':'No'}</td></tr>
            <tr><td>Correct Ghost type? [+5]</td><td>{data.CorrectGhostType ? 'Yes':'No'}</td></tr>
            <tr><td>Perfect game? [+2]</td><td>{data.PerfectGame ? 'Yes':'No'}</td></tr>
            <tr><td>Additional notes</td><td>{data.AdditionalNotes === '' ? 'N/A' : data.AdditionalNotes}</td></tr>
            <tr><td><b>Total score</b></td><td><b>{data.Marks}</b></td></tr>
          </tbody>
        </Table>
      ) : <Alert variant="primary" className="text-center">Loading or missing data</Alert>}
    </Container>
  );
}
