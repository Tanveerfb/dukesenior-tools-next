import { Alert, Card, Container, ListGroup } from 'react-bootstrap';

export default function PhasmoTourney2BracketPage() {
  return (
    <>
      <Alert className="text-center">The brackets of the tournament. <br /> *<b>bold</b> = the winner of that match</Alert>
      <Container className="d-flex flex-column mb-5">
        <Container className="d-flex flex-column flex-md-row align-items-center">
          <Container className="my-2">
            <Card className="text-center mb-2 p-1">
              <Card.Header className="fw-bold">Round 1 (Group matches) [Ridgeview Court]</Card.Header>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>Match 1 : Ram_Fighter vs <b>patsas</b></ListGroup.Item>
                  <ListGroup.Item>Match 2 : <b>KosmicHippie</b> vs Hannah_49_</ListGroup.Item>
                  <ListGroup.Item>Match 3 : Enokiacat vs <b>Gre_Kaz</b></ListGroup.Item>
                  <ListGroup.Item>Match 4 : bgflareon vs <b>Izumiachi</b></ListGroup.Item>
                </ListGroup>
              </Card.Body>
              <Card.Footer><Alert variant="secondary">4 Eliminated players can choose to grab another fighting chance in Second Chance Bracket</Alert></Card.Footer>
            </Card>
            <Card className="text-center mb-2 p-1">
              <Card.Header className="fw-bold">Round 2 (Group matches) [Willow street]</Card.Header>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>Match 5 : <b>Izumiachi</b> vs patsas</ListGroup.Item>
                  <ListGroup.Item>Match 6 : <b>KosmicHippie</b> vs Kaz</ListGroup.Item>
                  <ListGroup.Item>Match 7 : <b>Izumiachi</b> vs Kaz</ListGroup.Item>
                  <ListGroup.Item>Match 8 : <b>KosmicHippie</b> vs patsas</ListGroup.Item>
                </ListGroup>
              </Card.Body>
              <Card.Footer><Alert variant="secondary">1 player was eliminated at the end of Round 2 (They can choose to grab another fighting chance in Second Chance Bracket)</Alert></Card.Footer>
            </Card>
          </Container>
          <Container>
            <Card className="text-center mb-2 p-1">
              <Card.Header className="fw-bold">Second Chance Bracket [Tanglewood Drive]</Card.Header>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>SCB Elimination Match : @Hannah_49_ vs <b>@bgflareon</b> vs @Ram_Fighter vs @Gre_Kaz</ListGroup.Item>
                </ListGroup>
              </Card.Body>
              <Card.Footer><Alert variant="secondary">Winner earned a chance to play in the playoffs</Alert></Card.Footer>
            </Card>
          </Container>
        </Container>
        <Container className="mb-2 p-1">
          <Card className="text-center">
            <Card.Header className="fw-bold">Round 3 (Play offs) [Grafton Farmhouse]</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Match 9 : <b>Izumiachi</b> vs KosmicHippie</ListGroup.Item>
                <ListGroup.Item>Match 10 : patsas vs <b>bgflareon</b></ListGroup.Item>
                <ListGroup.Item>Match 11 : <b>KosmicHippie</b> vs bgflareon</ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer><Alert variant="secondary">2 players were eliminated from the tourney at the end of Round 3.<br /> Winners of Match 9 and 11 will head to finals.</Alert></Card.Footer>
          </Card>
          <Card className="text-center">
            <Card.Header className="fw-bold">Round 4 (Final) [Sunny Meadows Restricted]</Card.Header>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>Final [Best out of 3] : <b>Izumiachi</b> vs KosmicHippie</ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer><Alert variant="secondary">The winner of the tournament was decided in this round!</Alert></Card.Footer>
          </Card>
        </Container>
      </Container>
    </>
  );
}
