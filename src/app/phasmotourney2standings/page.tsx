import { Alert, Container, Table } from 'react-bootstrap';

export default function PhasmoTourney2StandingsPage() {
  return (
    <Container fluid className="p-3">
      <Alert>Current standings</Alert>
      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Total points</th>
            <th>Wins/Loses/Tie</th>
          </tr>
        </thead>
        <tbody>
          <tr id="winner">
            <td>1</td>
            <td>Izumiachi</td>
            <td>60</td>
            <td>3/0/0</td>
          </tr>
          <tr>
            <td>2</td>
            <td>kosmichippie</td>
            <td>55</td>
            <td>3/0/0</td>
          </tr>
          <tr>
            <td>3</td>
            <td>patsas</td>
            <td>35</td>
            <td>1/2/0</td>
          </tr>
        </tbody>
      </Table>
      <Alert className="text-center">Second chance bracket</Alert>
      <Table hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Points [Total points]</th>
            <th>Time taken</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Winner</b></td>
            <td>bgflareon</td>
            <td>18[36]</td>
            <td>07:38</td>
          </tr>
          <tr>
            <td>2</td>
            <td>ram_Fighter</td>
            <td>18[18]</td>
            <td>14:51</td>
          </tr>
          <tr>
            <td>3</td>
            <td>hannah_49_</td>
            <td>8[18]</td>
            <td>16:46</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Kaz</td>
            <td>4[28]</td>
            <td>06:58</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}
