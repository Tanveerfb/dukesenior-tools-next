"use client";
import { Alert, Card, Container, ListGroup } from 'react-bootstrap';
import BracketMatchInfo from './BracketMatchInfo';
export default function Round1(){
  return (
    <Container className="p-2 mb-3">
      <Alert>Round 1 [8 Teams]</Alert>
      <Container className="p-2 d-flex flex-column flex-md-row align-items-center">
        <Container className="p-2 d-flex flex-row flex-md-column">
          <Card className="text-center mb-2 p-1">
            <Card.Header className="fw-bold bg-primary text-white">Round 1</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Match 1 : <BracketMatchInfo team1="Team 6" team2="Team 2" roundnumber={1} /></ListGroup.Item>
                <ListGroup.Item>Match 2 : <BracketMatchInfo team1="Team 3" team2="Team 5" roundnumber={1} /></ListGroup.Item>
                <ListGroup.Item>Match 3 : <BracketMatchInfo team1="Team 4" team2="Team 7" roundnumber={1} /></ListGroup.Item>
                <ListGroup.Item>Match 4 : <BracketMatchInfo team1="Team 1" team2="Team 8" roundnumber={1} /></ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Card.Text><b>Map : </b><span className="fw-bolder text-info">Grafton Farmhouse</span></Card.Text>
              <Alert variant="secondary">4 Eliminated teams can choose to grab another fighting chance in Redemption Bracket</Alert>
            </Card.Footer>
          </Card>
        </Container>
        <Container className="p-2 d-flex flex-row flex-md-column">
          <Card className="text-center mb-2 p-1">
            <Card.Header className="fw-bold bg-danger text-white">Round 1 - Redemption Bracket</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Match 5 : <BracketMatchInfo team1="Team 6" team2="Team 7" roundnumber={1} redemption /></ListGroup.Item>
                <ListGroup.Item>Match 6 : <BracketMatchInfo team1="Team 5" team2="Team 8" roundnumber={1} redemption /></ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Card.Text><b>Map : </b><span className="fw-bolder text-info">10 Ridgeview Court</span></Card.Text>
              <Alert variant="secondary">2 teams will be eliminated in this Redemption Bracket</Alert>
            </Card.Footer>
          </Card>
        </Container>
      </Container>
    </Container>
  );
}
