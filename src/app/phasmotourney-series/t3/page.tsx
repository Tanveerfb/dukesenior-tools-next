import Link from 'next/link';
import { Container, Card } from 'react-bootstrap';

export default function T3(){
  return (
    <Container className="py-4">
      <h1>Phasmo Tourney 3</h1>
  <Card className="p-3 mt-3"><Link href="/phasmotourney-series/phasmotourney3">Open Tourney 3 pages</Link></Card>
    </Container>
  );
}
