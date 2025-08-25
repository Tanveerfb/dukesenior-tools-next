"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Alert, Button, Container, Table, Spinner } from 'react-bootstrap';
import { getPhasmoTourney3Document, getPhasmoTourney3Data } from '@/lib/services/phasmoTourney3';

export default function T3RunDetailsUnifiedPage(){
  const params = useParams<{id:string}>();
  const router = useRouter();
  const { id } = params;
  const [data,setData] = useState<any | null>(null);
  const [loading,setLoading] = useState(true);
  const [notFound,setNotFound] = useState(false);
  const [suggestions,setSuggestions] = useState<string[]>([]);

  const attemptFetch = useCallback(async(runID: string)=>{
    setLoading(true); setNotFound(false); setSuggestions([]);
    try {
      if(!runID) return;
      const doc = await getPhasmoTourney3Document(runID);
      if(doc){ setData(doc); return; }
      const snap = await getPhasmoTourney3Data();
      const allIDs: string[] = [];
      snap.forEach(d => allIDs.push(d.id));
      const parts = runID.split('-');
      const ts = parts[0];
      const normalized = (s:string)=> s.replace(/\s+/g,'').toLowerCase();
      const maybeTeam = parts.slice(1, parts.length-1).join('-');
      const maybeRound = parts[parts.length-1];
      const matches = allIDs.filter(idv => {
        if(idv === runID) return true;
        const pr = idv.split('-');
        if(pr.length < 3) return false;
        const its = pr[0];
        const team = pr.slice(1, pr.length-1).join('-');
        const round = pr[pr.length-1];
        const tsMatch = its === ts;
        const teamMatch = normalized(team) === normalized(maybeTeam);
        const roundMatch = normalized(round) === normalized(maybeRound);
        return (tsMatch && (teamMatch || roundMatch)) || (teamMatch && roundMatch);
      }).slice(0,10);
      setSuggestions(matches);
      setNotFound(true);
    } finally { setLoading(false); }
  },[]);

  const resolvedId = typeof id === 'string' ? id.replace(/_/g,' ') : id;
  useEffect(()=>{ attemptFetch(resolvedId); },[resolvedId, attemptFetch]);

  return (
    <Container fluid="lg">
      <Alert variant="primary" className="d-flex flex-row justify-content-between align-items-center flex-wrap gap-2">
        <Button onClick={()=> router.push('/phasmotourney-series/phasmotourney3/runs')} variant="secondary" className="text-white">Back to runs</Button>
      </Alert>
      {loading && <div className="text-center my-5"><Spinner animation="border" /> Loading run…</div>}
      {!loading && data && (
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
      )}
      {!loading && notFound && (
        <Alert variant="warning" className="mt-3">
          <div className="fw-bold mb-1">Run not found</div>
          We couldn't locate a document with the ID <code>{resolvedId}</code>.
          {suggestions.length > 0 && (
            <div className="mt-2">
              <div className="fw-semibold mb-1">Closest matches:</div>
              <div className="d-flex flex-wrap gap-2">
                {suggestions.map(s => <Button key={s} size="sm" variant="outline-secondary" onClick={()=> router.replace(`/phasmotourney-series/phasmotourney3/runs/${encodeURIComponent(s.replace(/\s+/g,'_'))}`)}>{s}</Button>)}
              </div>
            </div>
          )}
        </Alert>
      )}
    </Container>
  );
}
