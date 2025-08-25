import Link from 'next/link';
import { Container, Card } from 'react-bootstrap';

export default function T4(){
  return (
    <Container className="py-4">
      <h1>Phasmo Tourney 4</h1>
  <Card className="p-3 mt-3"><Link href="/phasmotourney-series/phasmotourney4">Open Tourney 4 pages</Link></Card>
    </Container>
  );
}
