import Link from 'next/link';
import { Container, Card } from 'react-bootstrap';

export default function T1(){
  return (
    <Container className="py-4">
      <h1>Phasmo Tourney 1</h1>
  <Card className="p-3 mt-3"><Link href="/phasmotourney-series/phasmotourney1">Open Tourney 1 pages</Link></Card>
    </Container>
  );
}
