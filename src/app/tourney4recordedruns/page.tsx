"use client";
import { useEffect, useState } from 'react';
import { Alert, Container, Form, Pagination, Table } from 'react-bootstrap';
import Link from 'next/link';
import { getPhasmoTourney4Data } from '@/lib/services/phasmoTourney4';

export default function Tourney4RecordedRunsPage(){
  const [data,setData] = useState<any[]>([]);
  const [ready,setReady] = useState(false);
  const [searchTerm,setSearchTerm] = useState('');
  const [currentPage,setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(()=>{(async()=>{ const snap = await getPhasmoTourney4Data(); const list:any[]=[]; snap.forEach(r=> list.push([r.data(), r.id])); setData(list); setReady(true); })();},[]);

  const filtered = data.filter(r => (
    r[0]?.Participant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r[0]?.CursedItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r[0]?.Evidences?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r[1]?.toLowerCase().includes(searchTerm.toLowerCase())
  ));
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageData = filtered.slice(startIndex, startIndex + itemsPerPage);

  function handlePageChange(p:number){ setCurrentPage(p); }

  return (
    <Container fluid>
      <h2 className="mt-3">Phasmo Tourney #4 Recorded Runs</h2>
      <Form.Group className="p-2 bg-info-subtle fw-bold">
        <Form.Control placeholder="Search runs (e.g. player name, cursed items, match ID)" value={searchTerm} onChange={e=>{setSearchTerm(e.target.value); setCurrentPage(1);}}/>
      </Form.Group>
      {ready ? (
        <>
          {totalPages>1 && (
            <Pagination className="m-1 justify-content-center">
              <Pagination.First onClick={()=>handlePageChange(1)} disabled={currentPage===1}/>
              <Pagination.Prev onClick={()=>handlePageChange(currentPage-1)} disabled={currentPage===1}/>
              {Array.from({length: totalPages}).map((_,i)=>(
                <Pagination.Item key={i+1} active={i+1===currentPage} onClick={()=>handlePageChange(i+1)}>{i+1}</Pagination.Item>
              ))}
              <Pagination.Next onClick={()=>handlePageChange(currentPage+1)} disabled={currentPage===totalPages}/>
              <Pagination.Last onClick={()=>handlePageChange(totalPages)} disabled={currentPage===totalPages}/>
            </Pagination>
          )}
          <Table striped hover responsive>
            <thead><tr><th>Player Name</th><th>Cursed Item</th><th>Time</th><th>Match ID</th><th>Link</th></tr></thead>
            <tbody>
              {pageData.map(r=>{
                let variant = '';
                if(r[0]?.CursedItem === 'Summoning Circle') variant='pyro';
                else if(r[0]?.CursedItem === 'Ouija Board') variant='geo';
                else if(r[0]?.CursedItem === 'Music Box') variant='hydro';
                else if(r[0]?.CursedItem === 'Haunted Mirror') variant='anemo';
                return (
                  <tr key={r[1]}>
                    <td className="fw-bold">{r[0]?.Participant}</td>
                    <td className={`text-${variant} fw-bold`}>{r[0]?.CursedItem}</td>
                    <td>{new Date(r[0]?.TimeSubmitted).toLocaleString()}</td>
                    <td className="text-tertiary">{r[1]}</td>
                    <td>{r[1] && <Link className="text-warning" href={`/tourney4rundetails/${r[1]}`}>Details</Link>}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      ) : <Alert>Data is not ready</Alert>}
    </Container>
  );
}
