"use client";
// Redesigned Phasmo Tourney 3 bracket: responsive horizontal flow of rounds.
// Uses a data schema to keep presentation lean & consistent.
import React from "react";
import { Row, Col, Card, ListGroup, Badge } from "react-bootstrap";
import { FaTrophy } from "react-icons/fa";
import BracketMatchInfo from "@/components/tourney3/BracketMatchInfo";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
// Redesigned Phasmo Tourney 3 bracket: responsive horizontal flow of rounds.
// Uses a data schema to keep presentation lean & consistent.
interface MatchDef {
  id: number;
  content: React.ReactNode;
  redemption?: boolean;
}
interface RoundDef {
  key: string;
  title: string;
  subtitle?: string;
  teamsNote?: string;
  map: string;
  matches: MatchDef[];
  redemptionMatches?: MatchDef[]; // optional secondary card
  redemptionNote?: string;
  extraNote?: string;
}

const rounds: RoundDef[] = [
  {
    key: "r1",
    title: "Round 1",
    subtitle: "Opening (8 Teams)",
    map: "Grafton Farmhouse",
    teamsNote: "4 eliminated teams may attempt Redemption.",
    matches: [
      {
        id: 1,
        content: (
          <BracketMatchInfo team1="Team 6" team2="Team 2" roundnumber={1} />
        ),
      },
      {
        id: 2,
        content: (
          <BracketMatchInfo team1="Team 3" team2="Team 5" roundnumber={1} />
        ),
      },
      {
        id: 3,
        content: (
          <BracketMatchInfo team1="Team 4" team2="Team 7" roundnumber={1} />
        ),
      },
      {
        id: 4,
        content: (
          <BracketMatchInfo team1="Team 1" team2="Team 8" roundnumber={1} />
        ),
      },
    ],
    redemptionMatches: [
      {
        id: 5,
        content: (
          <BracketMatchInfo
            team1="Team 6"
            team2="Team 7"
            roundnumber={1}
            redemption
          />
        ),
        redemption: true,
      },
      {
        id: 6,
        content: (
          <BracketMatchInfo
            team1="Team 5"
            team2="Team 8"
            roundnumber={1}
            redemption
          />
        ),
        redemption: true,
      },
    ],
    redemptionNote: "2 teams will be eliminated in this Redemption Bracket.",
  },
  {
    key: "r2",
    title: "Round 2",
    subtitle: "Main (6 Teams)",
    map: "13 Willow Street",
    teamsNote: "3 eliminated teams may attempt Redemption.",
    matches: [
      {
        id: 7,
        content: (
          <BracketMatchInfo team1="Team 1" team2="Team 4" roundnumber={2} />
        ),
      },
      {
        id: 8,
        content: (
          <BracketMatchInfo team1="Team 2" team2="Team 6" roundnumber={2} />
        ),
      },
      {
        id: 9,
        content: (
          <BracketMatchInfo team1="Team 3" team2="Team 5" roundnumber={2} />
        ),
      },
    ],
    redemptionMatches: [
      {
        id: 10,
        content: (
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span>Team 3 32/50</span>
            <span className="text-muted small">vs</span>
            <span>Team 4 45/50</span>
            <span className="text-muted small">vs</span>
            <Badge bg="success">Team 6 48/50</Badge>
          </div>
        ),
        redemption: true,
      },
    ],
    redemptionNote:
      "2 teams eliminated. Each team performs two runs; combined totals decide winner.",
  },
  {
    key: "r3",
    title: "Round 3",
    subtitle: "Semifinal (4 Teams)",
    map: "Bleasdale Farmhouse",
    teamsNote: "2 eliminated teams may attempt Redemption.",
    matches: [
      {
        id: 11,
        content: (
          <BracketMatchInfo team1="Team 2" team2="Team 5" roundnumber={3} />
        ),
      },
      {
        id: 12,
        content: (
          <BracketMatchInfo team1="Team 1" team2="Team 6" roundnumber={3} />
        ),
      },
    ],
    redemptionMatches: [
      {
        id: 13,
        content: (
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Badge bg="success" className="fw-semibold">
              Team 2 49/50
            </Badge>
            <span className="small text-muted">vs</span>
            <span>Team 2 18/25</span>
            <span className="small text-muted">(2nd run not attempted)</span>
          </div>
        ),
        redemption: true,
      },
    ],
    redemptionNote: "1 team eliminated after redemption showdown.",
    extraNote: "Two runs each; aggregate compared.",
  },
  {
    key: "finals",
    title: "Finals",
    subtitle: "Best of Three (3 Teams rotation)",
    map: "Sunny Meadows Mental Institution (Restricted)",
    matches: [
      {
        id: 14,
        content: (
          <>
            <Badge bg="success" className="me-1">
              Team 2
            </Badge>
            <b className="mx-1">vs</b>
            <span>Team 5</span>
          </>
        ),
      },
      {
        id: 15,
        content: (
          <>
            <Badge bg="success" className="me-1">
              Team 1
            </Badge>
            <b className="mx-1">vs</b>
            <span>Team 5</span>
          </>
        ),
      },
      {
        id: 16,
        content: (
          <>
            <span>Team 1</span>
            <b className="mx-1">vs</b>
            <Badge
              bg="success"
              className="d-inline-flex align-items-center gap-1"
            >
              <FaTrophy /> Team 2
            </Badge>
          </>
        ),
      },
    ],
    teamsNote:
      "Champion determined once a team secures decisive wins (trophy indicates champion).",
  },
];

function RoundColumn({ r }: { r: RoundDef }) {
  return (
    <Col xs={12} md className="d-flex flex-column gap-3 mb-4 mb-md-0">
      <Card className="h-100 shadow-sm border-0 bg-body-secondary bg-opacity-25">
        <Card.Header className="py-2 d-flex flex-column gap-1 bg-primary text-white">
          <span className="fw-bold small text-uppercase">{r.title}</span>
          <span className="fw-semibold" style={{ fontSize: "0.8rem" }}>
            {r.subtitle}
          </span>
        </Card.Header>
        <Card.Body className="p-2">
          <div className="small mb-2 text-muted">
            <b>Map:</b> {r.map}
          </div>
          <ListGroup variant="flush" className="small">
            {r.matches.map((m) => (
              <ListGroup.Item
                key={m.id}
                className="d-flex flex-column gap-1 py-2"
              >
                <div>
                  <Badge bg="secondary" pill className="me-2">
                    M{m.id}
                  </Badge>
                  {m.content}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          {r.teamsNote && (
            <div className="mt-2 small text-info">{r.teamsNote}</div>
          )}
          {r.extraNote && (
            <div className="mt-1 small text-muted fst-italic">
              {r.extraNote}
            </div>
          )}
        </Card.Body>
      </Card>
      {r.redemptionMatches && (
        <Card className="shadow-sm border-0 redemption-card">
          <Card.Header className="py-2 d-flex flex-column gap-1 bg-danger text-white">
            <span className="fw-bold small text-uppercase">
              {r.title} Redemption
            </span>
          </Card.Header>
          <Card.Body className="p-2">
            <ListGroup variant="flush" className="small">
              {r.redemptionMatches.map((m) => (
                <ListGroup.Item
                  key={m.id}
                  className="d-flex flex-column gap-1 py-2"
                >
                  <div>
                    <Badge bg="dark" pill className="me-2">
                      M{m.id}
                    </Badge>
                    {m.content}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            {r.redemptionNote && (
              <div className="mt-2 small text-danger-emphasis">
                {r.redemptionNote}
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </Col>
  );
}

export default function T3BracketPage() {
  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 3", href: "/phasmotourney-series/phasmotourney3" },
    { label: "Bracket" },
  ]);

  return (
    <TourneyPage
      title="Phasmo Tourney 3 Bracket"
      subtitle="Journey from eight squads to the champion, including redemption paths."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 3" }, { label: "Bracket" }]}
      containerProps={{ fluid: "lg", className: "py-3" }}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="small text-muted">
            Progression from 8 teams to final champion with live score
            highlighting.
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 small">
          <span className="d-flex align-items-center gap-1">
            <Badge bg="primary">Main</Badge> Main Round
          </span>
          <span className="d-flex align-items-center gap-1">
            <Badge bg="danger">R</Badge> Redemption
          </span>
          <span className="d-flex align-items-center gap-1">
            <Badge bg="secondary">M#</Badge> Match #
          </span>
        </div>
      </div>
      <Row
        className="g-3 flex-nowrap overflow-auto pb-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {rounds.map((r) => (
          <RoundColumn key={r.key} r={r} />
        ))}
      </Row>
      <div className="mt-4 small text-muted">
        Scores & winners update automatically as data changes (highlight via
        BracketMatchInfo). Redemption cards list tie-break / second-chance
        paths.
      </div>
    </TourneyPage>
  );
}
