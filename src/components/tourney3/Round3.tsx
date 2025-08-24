"use client";
import { Alert, Card, Container, ListGroup } from 'react-bootstrap';
import BracketMatchInfo from './BracketMatchInfo';
export default function Round3(){
  return (
    <Container className="p-2 mb-3">
      <Alert>Round 3 [4 teams]</Alert>
      <Container className="p-2 d-flex flex-column flex-md-row align-items-center">
        <Container className="p-2 d-flex flex-row flex-md-column">
          <Card className="text-center mb-2 p-1">
            <Card.Header className="fw-bold bg-primary text-white">Round 3</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Match 11 : <BracketMatchInfo team1="Team 2" team2="Team 5" roundnumber={3} /></ListGroup.Item>
                <ListGroup.Item>Match 12 : <BracketMatchInfo team1="Team 1" team2="Team 6" roundnumber={3} /></ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Card.Text><b>Map : </b><span className="fw-bolder text-info">Bleasdale Farmhouse</span></Card.Text>
              <Alert variant="secondary">2 Eliminated teams can choose to grab another fighting chance in Redemption Bracket</Alert>
            </Card.Footer>
          </Card>
        </Container>
        <Container className="p-2 d-flex flex-row flex-md-column">
          <Card className="text-center mb-2 p-1">
            <Card.Header className="fw-bold bg-danger text-white">Round 3 - Redemption Bracket</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Match 13 : <span className="fw-bold text-dendro">Team 2 [49/50]</span> <span className="fw-bold">&nbsp;vs&nbsp;</span><span>Team 2 [18/25] [2nd run was not attempted]</span></ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Card.Text><b>Map : </b><span className="fw-bolder text-info">42 Edgefield Road</span></Card.Text>
              <Alert variant="primary">Teams will do 2 runs each. The total from those 2 runs will be compared against other team to get the winner of the redemption bracket.</Alert>
              <Alert variant="secondary">1 team will be eliminated in this Redemption Bracket</Alert>
            </Card.Footer>
          </Card>
        </Container>
      </Container>
    </Container>
  );
}
