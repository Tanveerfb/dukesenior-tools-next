"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, Button, Container, Table } from 'react-bootstrap';
import { getPhasmoTourney3Document } from '@/lib/services/phasmoTourney3';

export default function Tourney3RunDetailsPage(){
  const params = useParams<{id:string}>();
  const router = useRouter();
  const { id } = params;
  const [data,setData] = useState<any | null>(null);
  const [ready,setReady] = useState(false);
  useEffect(()=>{(async()=>{ if(!id) return; const d = await getPhasmoTourney3Document(id); setData(d||null); setReady(true); })();},[id]);
  return (
    <Container fluid="lg">
      <Alert variant="primary" className="d-flex flex-row justify-content-between align-items-center">
        <Button onClick={()=> router.back()} variant="tertiary" className="text-white">Go back</Button>
        <span className="p-1 m-auto"><b>{data?.Participant}</b>'s run recorded on <br/><b>{data?.TimeSubmitted ? new Date(data.TimeSubmitted).toString(): ''}</b></span>
      </Alert>
      {ready && data ? (
        <Table hover responsive>
          <thead><tr><th>Score name</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Officer name</td><td>{data.Officer}</td></tr>
            <tr><td>Team</td><td>{data.Participant}</td></tr>
            <tr><td>Round Played</td><td>{data.Round}{data.Redemption ? ' Redemption' : ''}</td></tr>
            <tr><td>Ghost picture [+3]</td><td>{data.GhostPictureTaken ? 'true':'false'}</td></tr>
            <tr><td>Bone Picture [+2]</td><td>{data.BonePictureTaken ? 'true':'false'}</td></tr>
            <tr><td>Objective 1 [+2]</td><td>{data.Objective1 ? 'true':'false'}</td></tr>
            <tr><td>Objective 2 [+2]</td><td>{data.Objective2 ? 'true':'false'}</td></tr>
            <tr><td>Objective 3 [+2]</td><td>{data.Objective3 ? 'true':'false'}</td></tr>
            <tr><td>Survived [+5/+2/-5]</td><td>{String(data.Survived)}</td></tr>
            <tr><td>Correct Ghost type? [+5]</td><td>{data.CorrectGhostType ? 'true':'false'}</td></tr>
            <tr><td>Perfect game? [+2]</td><td>{data.PerfectGame ? 'true':'false'}</td></tr>
            <tr><td>Time Criteria? [+2/+1/0]</td><td>{data.Time}</td></tr>
            <tr><td>Additional notes</td><td>{data.AdditionalNotes === '' ? 'N/A' : data.AdditionalNotes}</td></tr>
            <tr><td><b>Total score</b></td><td><b>{data.Marks}</b></td></tr>
          </tbody>
        </Table>
      ) : <Alert variant="primary" className="text-center">Loading or missing data</Alert>}
    </Container>
  );
}
