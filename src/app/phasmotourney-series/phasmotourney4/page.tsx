"use client";
import { useMemo, useState } from "react";
import { Badge, Card, Col, Form, Modal, Row, Tab, Tabs } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import matchesData from "@/data/phasmoTourney4Matches.json";

interface MatchJSON {
  match: number;
  bracket: "Bracket 1" | "Bracket 2" | "Playoffs";
  player1: string;
  score1: number;
  player2: string;
  score2: number;
  winner?: string;
}

// Presentational card built entirely from static JSON record
function StaticMatchCard({
  m,
  onClick,
}: {
  m: MatchJSON;
  onClick: () => void;
}) {
  const isTie =
    (m.score1 === m.score2 && m.score1 !== 0) ||
    (!m.winner && m.score1 === m.score2 && m.bracket !== "Playoffs");
  const resolvedWinner =
    m.winner ||
    (m.score1 > m.score2
      ? m.player1
      : m.score2 > m.score1
      ? m.player2
      : undefined);
  let summary: string;
  if (m.winner && m.match === 10 && m.bracket === "Playoffs") {
    summary = `Champion: ${m.winner}`;
  } else if (isTie) {
    summary = `${m.player1} ${m.score1} – ${m.score2} ${m.player2} • Tie`;
  } else if (resolvedWinner) {
    summary = `${m.player1} ${m.score1} – ${m.score2} ${m.player2} • ${resolvedWinner} wins`;
  } else {
    summary = "Result pending migration";
  }
  return (
    <Card
      className="mb-2 shadow-sm match-card"
      role="button"
      onClick={onClick}
      aria-label={`Match ${m.match} ${m.player1} versus ${m.player2} ${summary}`}
    >
      <Card.Body className="py-2">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="small text-secondary">Match {m.match}</span>
          {m.bracket === "Playoffs" && (
            <Badge bg="warning" text="dark">
              Playoffs
            </Badge>
          )}
        </div>
        <div className="d-flex flex-column gap-1">
          <div className="d-flex justify-content-between align-items-center">
            <span
              className={`fw-semibold ${
                resolvedWinner === m.player1 && !isTie ? "text-success" : ""
              }`}
            >
              {m.player1}
            </span>
            <Badge
              bg={
                resolvedWinner === m.player1 && !isTie ? "success" : "secondary"
              }
            >
              {m.score1}
            </Badge>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span
              className={`fw-semibold ${
                resolvedWinner === m.player2 && !isTie ? "text-success" : ""
              }`}
            >
              {m.player2}
            </span>
            <Badge
              bg={
                resolvedWinner === m.player2 && !isTie ? "success" : "secondary"
              }
            >
              {m.score2}
            </Badge>
          </div>
        </div>
        <div className="mt-2 small text-muted">{summary}</div>
      </Card.Body>
    </Card>
  );
}

export default function Tourney4BracketGroupedPage() {
  const [active, setActive] = useState<"b1" | "b2" | "playoffs">("b1");
  const [search, setSearch] = useState("");
  const [modalMatch, setModalMatch] = useState<MatchJSON | null>(null);

  const { b1, b2, playoffs } = useMemo(() => {
    const b1 = (matchesData as MatchJSON[])
      .filter((m) => m.bracket === "Bracket 1")
      .sort((a, b) => a.match - b.match);
    const b2 = (matchesData as MatchJSON[])
      .filter((m) => m.bracket === "Bracket 2")
      .sort((a, b) => a.match - b.match);
    const playoffs = (matchesData as MatchJSON[])
      .filter((m) => m.bracket === "Playoffs")
      .sort((a, b) => a.match - b.match);
    return { b1, b2, playoffs };
  }, []);

  function filter(list: MatchJSON[]) {
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter(
      (m) =>
        m.player1.toLowerCase().includes(term) ||
        m.player2.toLowerCase().includes(term) ||
        `${m.match}`.includes(term) ||
        m.bracket.toLowerCase().includes(term)
    );
  }

  const stageList = active === "b1" ? b1 : active === "b2" ? b2 : playoffs;
  const filtered = filter(stageList);

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 4", href: "/phasmotourney-series/phasmotourney4" },
    { label: "Brackets & Playoffs" },
  ]);

  return (
    <TourneyPage
      title="Phasmo Tourney 4"
      subtitle="Browse the full bracket archive, including both pools and the playoff gauntlet."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Archive" }, { label: "Bracket" }]}
      containerProps={{ fluid: true, className: "py-3" }}
      extraHeader={
        <div className="text-muted small">
          Static import from the 2023 sheet. Results kept for historical
          reference.
        </div>
      }
    >
      <h2 className="h4 mb-3">Brackets & Playoffs</h2>
      <Form className="mb-3">
        <Form.Control
          placeholder="Search players, match #, stage..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search matches"
        />
      </Form>
      <Tabs
        activeKey={active}
        onSelect={(k) => setActive(k as any)}
        className="mb-3"
      >
        <Tab eventKey="b1" title={`Bracket 1 (${b1.length})`} />
        <Tab eventKey="b2" title={`Bracket 2 (${b2.length})`} />
        <Tab eventKey="playoffs" title={`Playoffs (${playoffs.length})`} />
      </Tabs>
      <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-2">
        {filtered.map((m) => (
          <Col key={`${m.bracket}-${m.match}`}>
            <StaticMatchCard m={m} onClick={() => setModalMatch(m)} />
          </Col>
        ))}
        {filtered.length === 0 && (
          <Col>
            <div className="text-muted fst-italic">No matches found.</div>
          </Col>
        )}
      </Row>
      <Modal show={!!modalMatch} onHide={() => setModalMatch(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Match {modalMatch?.match} – {modalMatch?.player1} vs{" "}
            {modalMatch?.player2}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMatch && (
            <div>
              <p className="mb-1">
                <strong>Bracket:</strong> {modalMatch.bracket}
              </p>
              <p className="mb-1">
                <strong>Scoreline:</strong> {modalMatch.player1}{" "}
                {modalMatch.score1} – {modalMatch.score2} {modalMatch.player2}
              </p>
              {modalMatch.score1 === modalMatch.score2 &&
                !modalMatch.winner && (
                  <Badge bg="dark" className="me-2">
                    Tie
                  </Badge>
                )}
              {modalMatch.winner && (
                <Badge bg="success" className="me-2">
                  Winner: {modalMatch.winner}
                </Badge>
              )}
              {modalMatch.winner &&
                modalMatch.match === 10 &&
                modalMatch.bracket === "Playoffs" && (
                  <Badge bg="warning" text="dark">
                    Champion
                  </Badge>
                )}
            </div>
          )}
        </Modal.Body>
      </Modal>
      <style jsx global>{`
        .match-card:hover {
          outline: 2px solid var(--bs-primary);
        }
      `}</style>
    </TourneyPage>
  );
}
