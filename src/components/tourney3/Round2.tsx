"use client";
import { Alert, Card, Container, ListGroup } from 'react-bootstrap';
import BracketMatchInfo from './BracketMatchInfo';
export default function Round2(){
  return (
    <Container className="p-2 mb-3">
      <Alert>Round 2 [6 teams]</Alert>
      <Container className="p-2 d-flex flex-column flex-md-row align-items-center">
        <Container className="p-2 d-flex flex-row flex-md-column">
          <Card className="text-center mb-2 p-1">
            <Card.Header className="fw-bold bg-primary text-white">Round 2</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Match 7 : <BracketMatchInfo team1="Team 1" team2="Team 4" roundnumber={2} /></ListGroup.Item>
                <ListGroup.Item>Match 8 : <BracketMatchInfo team1="Team 2" team2="Team 6" roundnumber={2} /></ListGroup.Item>
                <ListGroup.Item>Match 9 : <BracketMatchInfo team1="Team 3" team2="Team 5" roundnumber={2} /></ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Card.Text><b>Map : </b><span className="fw-bolder text-info">13 Willow Street</span></Card.Text>
              <Alert variant="secondary">3 Eliminated teams can choose to grab another fighting chance in Redemption Bracket</Alert>
            </Card.Footer>
          </Card>
        </Container>
        <Container className="p-2 d-flex flex-row flex-md-column">
          <Card className="text-center mb-2 p-1">
            <Card.Header className="fw-bold bg-danger text-white">Round 2 - Redemption Bracket</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Match 10 : <span>Team 3[32/50] </span> <b>vs</b> <span>Team 4[45/50] </span> <b>vs</b> <span className=" text-dendro fw-bold">Team 6[48/50] </span></ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Card.Text><b>Map : </b><span className="fw-bolder text-info">6 Tanglewood Drive</span></Card.Text>
              <Alert variant="primary">Teams will do 2 runs each. The total from those 2 runs will be compared against other teams to get the winner of the redemption bracket.</Alert>
              <Alert variant="secondary">2 teams will be eliminated in this Redemption Bracket</Alert>
            </Card.Footer>
          </Card>
        </Container>
      </Container>
    </Container>
  );
}
