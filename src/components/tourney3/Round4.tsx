"use client";
import { Alert, Card, Container, ListGroup } from 'react-bootstrap';
export default function Round4(){
  return (
    <Container className="p-2 mb-3">
      <Alert>Finals [3 teams]</Alert>
      <Container className="p-2 d-flex flex-column flex-md-row align-items-center">
        <Container className="p-2 d-flex flex-row flex-md-column">
          <Card className="text-center mb-2 p-1">
            <Card.Header className="fw-bold bg-primary text-white">Finals</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Match 14 : <span className="fw-bold text-dendro">Team 2 </span><span className="fw-bold">&nbsp;vs&nbsp;</span><span>Team 5</span></ListGroup.Item>
                <ListGroup.Item>Match 15 : <span className="fw-bold text-dendro">Team 1 </span><span className="fw-bold">&nbsp;vs&nbsp;</span><span>Team 5</span></ListGroup.Item>
                <ListGroup.Item>Match 16 : <span>Team 1</span><span className="fw-bold">&nbsp;vs&nbsp;</span><span className="fw-bold text-dendro">Team 2 </span></ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Card.Text><b>Map : </b><span className="fw-bolder text-info">Sunny Meadows Mental Institution (Restricted)</span></Card.Text>
              <Alert variant="secondary">The <span className="fw-bold text-success">Winner</span> of the tournament was decided in this round!</Alert>
              <span className="text-dendro fw-bold"></span>
            </Card.Footer>
          </Card>
        </Container>
      </Container>
    </Container>
  );
}
