import Link from 'next/link';
import { Container, Card } from 'react-bootstrap';

export default function T2(){
  return (
    <Container className="py-4">
      <h1>Phasmo Tourney 2</h1>
  <Card className="p-3 mt-3"><Link href="/phasmotourney-series/phasmotourney2">Open Tourney 2 pages</Link></Card>
    </Container>
  );
}
