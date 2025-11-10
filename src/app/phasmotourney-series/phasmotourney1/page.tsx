"use client";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  InputGroup,
  Table,
} from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { tourneyDataExport } from "@/lib/services/phasmoTourney1";

export default function PhasmoTourney1FormPage() {
  // ...existing code reused from original phasmotourney1/page.tsx
  const officer = useRef<HTMLSelectElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const username = useRef<HTMLInputElement>(null);
  const phasmomap = useRef<HTMLSelectElement>(null);
  const ghostpicture = useRef<HTMLInputElement>(null);
  const bonepicture = useRef<HTMLInputElement>(null);
  const curseditemuse = useRef<HTMLInputElement>(null);
  const objective1 = useRef<HTMLInputElement>(null);
  const objective2 = useRef<HTMLInputElement>(null);
  const objective3 = useRef<HTMLInputElement>(null);
  const notes = useRef<HTMLTextAreaElement>(null);
  const stars = useRef<HTMLSelectElement>(null);
  const [survived, setSurvived] = useState(true);
  const [error, setError] = useState("");
  const [correctGhost, setCorrectGhost] = useState(true);
  const [resultScreen, setResultScreen] = useState(false);
  const [marks, setMarks] = useState(0);

  function toggleSurvival() {
    setSurvived((s) => !s);
  }
  function toggleCorrectGhost() {
    setCorrectGhost((c) => !c);
  }

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    let m = 0;
    if (ghostpicture.current?.checked) m += 5;
    if (bonepicture.current?.checked) m += 1;
    if (curseditemuse.current?.checked) m += 1;
    if (objective1.current?.checked) m += 1;
    if (objective2.current?.checked) m += 1;
    if (objective3.current?.checked) m += 1;
    if (stars.current?.value === "30 stars (Criteria met)") m += 5;
    else if (stars.current?.value === "20-29 stars or criteria not met") m += 2;
    else if (stars.current?.value === "Less than 20 stars") m += 1;
    m += survived ? 5 : -2;
    if (correctGhost) m += 5;
    setMarks(m);

    if (password.current?.value === "1234") {
      await tourneyDataExport(
        officer.current!.value,
        username.current!.value,
        phasmomap.current!.value,
        !!ghostpicture.current?.checked,
        !!bonepicture.current?.checked,
        !!curseditemuse.current?.checked,
        !!objective1.current?.checked,
        !!objective2.current?.checked,
        !!objective3.current?.checked,
        stars.current!.value,
        survived,
        correctGhost,
        notes.current?.value || ""
      );
      setResultScreen(true);
    } else {
      setError(
        "{Officer access only}. Type in the correct password and try again."
      );
    }
  }
  function reset() {
    setMarks(0);
    setSurvived(true);
    setCorrectGhost(true);
    setResultScreen(false);
    setError("");
  }

  const breadcrumbs = buildTourneyBreadcrumbs([{ label: "Phasmo Tourney 1" }]);

  return (
    <TourneyPage
      title="Phasmo Tourney 1 Submission"
      subtitle="Legacy form used by officers to log official runs. Data writes directly to the Firestore archive."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 1" }, { label: "Admin Tool" }]}
      containerProps={{ fluid: "md", className: "py-4" }}
    >
      {error && (
        <Alert variant="danger" className="m-0 text-center">
          {error}
        </Alert>
      )}
      {resultScreen ? (
        <div className="p-2 d-flex flex-column">
          <Alert variant="primary" className="text-center">
            Congratulations! You got {marks} marks.
          </Alert>
          <Button
            variant="secondary"
            onClick={reset}
            className="align-self-center"
          >
            Another run?
          </Button>
        </div>
      ) : (
        <Form className="p-3 m-auto" onSubmit={calculate}>
          <Alert variant="primary" className="text-center">
            Phasmo Tourney #1 (2024)
          </Alert>
          <FormGroup className="mb-3">
            <Form.Select className="text-center" ref={officer} required>
              <option>Select officer completing this form </option>
              <option value="dukesenior">@DukeSenior</option>
              <option value="phoenixsamaowo">@Phoenixsamaowo</option>
            </Form.Select>
            <InputGroup className="mt-2">
              <InputGroup.Text>Password for officer</InputGroup.Text>
              <Form.Control type="password" required ref={password} />
            </InputGroup>
          </FormGroup>
          <Alert variant="danger" className="text-center">
            During the investigation :
          </Alert>
          <FormGroup className="mb-3 d-flex flex-column flex-md-row gap-2">
            <Form.Label>Twitch.tv/</Form.Label>
            <Form.Control type="text" maxLength={30} ref={username} required />
          </FormGroup>
          <FormGroup className="mb-3">
            <Form.Select aria-label="phasmo-map" ref={phasmomap} required>
              <option>Phasmophobia map</option>
              <option value="10 Ridgeview Court">10 Ridgeview Court</option>
              <option value="42 Edgefield Road">42 Edgefield Road</option>
              <option value="Grafton Farmhouse">Grafton Farmhouse</option>
              <option value="Bleasdale Farmhouse">Bleasdale Farmhouse</option>
            </Form.Select>
          </FormGroup>
          <Table hover size="sm" responsive="md">
            <tbody>
              <tr>
                <td>
                  <Form.Check
                    type="switch"
                    label="Ghost picture"
                    ref={ghostpicture}
                  />
                </td>
                <td>
                  <Form.Check
                    type="switch"
                    label="Bone picture"
                    ref={bonepicture}
                  />
                </td>
                <td>
                  <Form.Check
                    type="switch"
                    label="Cursed item use"
                    ref={curseditemuse}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <Form.Check
                    type="switch"
                    label="Objective 1"
                    ref={objective1}
                  />
                </td>
                <td>
                  <Form.Check
                    type="switch"
                    label="Objective 2"
                    ref={objective2}
                  />
                </td>
                <td>
                  <Form.Check
                    type="switch"
                    label="Objective 3"
                    ref={objective3}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
          <Alert variant="danger" className="text-center">
            Post investigation summary :
          </Alert>
          <FormGroup>
            <Form.Label>Photos: </Form.Label>
            <Form.Select
              className="my-1"
              aria-label="photos-stars"
              ref={stars}
              required
            >
              <option>Total stars for pictures</option>
              <option value="30 stars (Criteria met)">
                30 stars (Must have ghost and bone picture)
              </option>
              <option value="20-29 stars or criteria not met">
                20-29 stars (select if ghost/bone picture not taken)
              </option>
              <option value="Less than 20 stars">Less than 20 stars</option>
            </Form.Select>
          </FormGroup>
          <FormGroup className="mb-1">
            <ButtonGroup className="d-flex">
              <Button
                variant={survived ? "dendro" : "outline-dendro"}
                disabled={survived}
                onClick={toggleSurvival}
                className="m-1"
              >
                Survived
              </Button>
              <Button
                variant={!survived ? "hydro" : "outline-hydro"}
                disabled={!survived}
                onClick={toggleSurvival}
                className="m-1"
              >
                Died
              </Button>
            </ButtonGroup>
          </FormGroup>
          <FormGroup className="mb-1">
            <ButtonGroup className="d-flex">
              <Button
                variant={correctGhost ? "dendro" : "outline-dendro"}
                disabled={correctGhost}
                onClick={toggleCorrectGhost}
                className="m-1"
              >
                Correct ghost type
              </Button>
              <Button
                variant={!correctGhost ? "hydro" : "outline-hydro"}
                disabled={!correctGhost}
                onClick={toggleCorrectGhost}
                className="m-1"
              >
                Incorrect type
              </Button>
            </ButtonGroup>
          </FormGroup>
          <FormGroup className="d-flex flex-column mb-3">
            <Form.Label>Additional notes: </Form.Label>
            <Form.Control as="textarea" className="mb-2" rows={4} ref={notes} />
            <Button type="submit" variant="tertiary" className="m-1 text-white">
              Submit and check
            </Button>
          </FormGroup>
        </Form>
      )}
    </TourneyPage>
  );
}
