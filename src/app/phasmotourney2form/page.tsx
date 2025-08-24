"use client";
import { useRef, useState } from 'react';
import { Alert, Button, ButtonGroup, Container, Form, FormGroup, Table } from 'react-bootstrap';
import { tourney2DataExport } from '@/lib/services/phasmoTourney2';
import { useAuth } from '@/hooks/useAuth';

export default function PhasmoTourney2FormPage() {
  const { user } = useAuth();
  const officer = useRef<HTMLInputElement>(null);
  const username = useRef<HTMLInputElement>(null);
  const phasmomap = useRef<HTMLSelectElement>(null);
  const ghostpicture = useRef<HTMLInputElement>(null);
  const bonepicture = useRef<HTMLInputElement>(null);
  const objective1 = useRef<HTMLInputElement>(null);
  const objective2 = useRef<HTMLInputElement>(null);
  const objective3 = useRef<HTMLInputElement>(null);
  const notes = useRef<HTMLTextAreaElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);
  const [survived, setSurvived] = useState(true);
  const [correctGhost, setCorrectGhost] = useState(true);
  const [perfectGame, setPerfectGame] = useState(true);
  const [resultScreen, setResultScreen] = useState(false);
  const [marks, setMarks] = useState(0);

  function toggleSurvival() { setSurvived(s => !s); }
  function toggleCorrectGhost() { setCorrectGhost(c => !c); }
  function togglePerfectGame() { setPerfectGame(p => !p); }

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    let m = 0;
    if (ghostpicture.current?.checked) m += 3;
    if (bonepicture.current?.checked) m += 2;
    if (objective1.current?.checked) m += 1;
    if (objective2.current?.checked) m += 1;
    if (objective3.current?.checked) m += 1;
    m += survived ? 5 : -2;
    if (correctGhost) m += 5;
    if (perfectGame) m += 2;
    setMarks(m);

    await tourney2DataExport(
      officer.current?.value || '',
      username.current?.value || '',
      phasmomap.current?.value || '',
      !!ghostpicture.current?.checked,
      !!bonepicture.current?.checked,
      !!objective1.current?.checked,
      !!objective2.current?.checked,
      !!objective3.current?.checked,
      survived,
      correctGhost,
      perfectGame,
      minutesRef.current?.value || '00',
      secondsRef.current?.value || '00',
      notes.current?.value || ''
    );

    setResultScreen(true);
  }
  function reset() {
    setMarks(0); setSurvived(true); setCorrectGhost(true); setPerfectGame(true); setResultScreen(false);
  }

  return (
    <Container fluid="md" className="mb-3">
      {resultScreen ? (
        <Container className="p-2 d-flex flex-column">
          <Alert variant="primary" className="text-center">Congratulations! You got {marks} marks.</Alert>
          <Button variant="secondary" onClick={reset}>Another run?</Button>
        </Container>
      ) : (
        <Form className="p-3 m-auto" onSubmit={calculate}>
          <Alert variant="primary" className="text-center">DukeSenior's Phasmo Tourney #2 (2024)</Alert>
          <FormGroup className="mb-3">
            <Form.Label>Name of the person filling this form</Form.Label>
            <Form.Control ref={officer} defaultValue={user?.displayName || ''} disabled={!user?.displayName} required />
          </FormGroup>
          <Alert variant="danger" className="text-center">During the investigation :</Alert>
          <FormGroup className="mb-3">
            <Form.Label>Player name / Twitch username</Form.Label>
            <Form.Control type="text" maxLength={30} ref={username} required />
          </FormGroup>
          <FormGroup className="mb-3">
            <Form.Select aria-label="phasmo-map" ref={phasmomap} required>
              <option value="">Phasmophobia map</option>
              <option value="10 Ridgeview Court">10 Ridgeview Court</option>
              <option value="Grafton Farmhouse">Grafton Farmhouse</option>
              <option value="Willow Street">Willow Street</option>
              <option value="Sunny Meadows Restricted">Sunny Meadows Restricted</option>
              <option value="SCB Special">SCB Special</option>
            </Form.Select>
          </FormGroup>
          <Table hover size="sm" responsive="md">
            <tbody>
              <tr>
                <td><Form.Check type="switch" label="Ghost picture" ref={ghostpicture} /></td>
                <td><Form.Check type="switch" label="Bone picture" ref={bonepicture} /></td>
              </tr>
              <tr>
                <td><Form.Check type="switch" label="Objective 1" ref={objective1} /></td>
                <td><Form.Check type="switch" label="Objective 2" ref={objective2} /></td>
                <td><Form.Check type="switch" label="Objective 3" ref={objective3} /></td>
              </tr>
            </tbody>
          </Table>
          <Alert variant="danger" className="text-center">Post investigation summary :</Alert>
          <FormGroup className="mb-1">
            <ButtonGroup className="d-flex">
              <Button variant={survived ? 'primary' : 'outline-primary'} disabled={survived} onClick={toggleSurvival} className="m-1">Survived</Button>
              <Button variant={!survived ? 'tertiary' : 'outline-tertiary'} disabled={!survived} onClick={toggleSurvival} className="m-1">Died</Button>
            </ButtonGroup>
          </FormGroup>
          <FormGroup className="mb-1">
            <ButtonGroup className="d-flex">
              <Button variant={correctGhost ? 'primary' : 'outline-primary'} disabled={correctGhost} onClick={toggleCorrectGhost} className="m-1">Correct ghost type</Button>
              <Button variant={!correctGhost ? 'tertiary' : 'outline-tertiary'} disabled={!correctGhost} onClick={toggleCorrectGhost} className="m-1">Incorrect type</Button>
            </ButtonGroup>
          </FormGroup>
          <FormGroup className="mb-1">
            <ButtonGroup className="d-flex">
              <Button variant={perfectGame ? 'primary' : 'outline-primary'} disabled={perfectGame} onClick={togglePerfectGame} className="m-1">Perfect game</Button>
              <Button variant={!perfectGame ? 'tertiary' : 'outline-tertiary'} disabled={!perfectGame} onClick={togglePerfectGame} className="m-1">Normal game</Button>
            </ButtonGroup>
          </FormGroup>
          <FormGroup className="mb-1">
            <Form.Label>Total time investigating :</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control type="number" placeholder="Minutes" maxLength={2} min={0} max={99} ref={minutesRef} required />
              <Form.Control type="number" placeholder="Seconds" maxLength={2} min={0} max={59} ref={secondsRef} required />
            </div>
          </FormGroup>
          <FormGroup className="d-flex flex-column mb-3">
            <Form.Label>Additional notes:</Form.Label>
            <Form.Control as="textarea" className="mb-2" rows={4} placeholder="Type details of the run." ref={notes} />
            <Button type="submit" variant="tertiary" className="m-1 text-white">Submit and check</Button>
          </FormGroup>
        </Form>
      )}
    </Container>
  );
}
