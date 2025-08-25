import Link from 'next/link';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function SeriesIndex(){
  const items = [
    { id: 't1', title: 'Phasmo Tourney 1', href: '/phasmotourney-series/t1' },
    { id: 't2', title: 'Phasmo Tourney 2', href: '/phasmotourney-series/t2' },
    { id: 't3', title: 'Phasmo Tourney 3', href: '/phasmotourney-series/t3' },
    { id: 't4', title: 'Phasmo Tourney 4', href: '/phasmotourney-series/t4' },
  ];
  return (
    <Container className="py-4">
      <h1 className="mb-4">Phasmo Tourney Series</h1>
      <Row className="g-3">
        {items.map(i=> (
          <Col md={6} lg={3} key={i.id}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{i.title}</Card.Title>
                <Link href={i.href} className="btn btn-outline-primary mt-2">Open</Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
