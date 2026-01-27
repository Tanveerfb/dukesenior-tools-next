"use client";

import { use } from "react";
import { Badge, Card, Col, ListGroup, Row, Tab, Tabs, Table } from "react-bootstrap";
import { FaTrophy, FaUsers, FaCalendar, FaChartBar } from "react-icons/fa";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { getTournamentMeta, getTournamentOverview } from "@/lib/data/tournamentArchive";
import D3Bracket from "@/components/bracket/D3Bracket";
import type { BracketNode } from "@/types/archive";

interface TourneyDetailPageProps {
  params: Promise<{ tourneyId: string }>;
}

export default function TourneyDetailPage({ params }: TourneyDetailPageProps) {
  const { tourneyId } = use(params);
  
  const tournament = getTournamentMeta(tourneyId);
  const overview = getTournamentOverview(tourneyId);

  if (!tournament || !overview) {
    return (
      <div className="container py-5">
        <h1>Tournament Not Found</h1>
        <p>The tournament you're looking for doesn't exist.</p>
      </div>
    );
  }

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Archive", href: "/phasmotourney-series/archive" },
    { label: tournament.title },
  ]);

  // Placeholder bracket data - will be replaced with real data in future
  const placeholderBracketData: BracketNode[] = [
    {
      id: "r1-m1",
      round: 1,
      match: 1,
      player1: "Player A",
      player2: "Player B",
      score1: 2,
      score2: 1,
      winner: "Player A",
      nextMatchId: "r2-m1",
    },
    {
      id: "r1-m2",
      round: 1,
      match: 2,
      player1: "Player C",
      player2: "Player D",
      score1: 1,
      score2: 2,
      winner: "Player D",
      nextMatchId: "r2-m1",
    },
    {
      id: "r2-m1",
      round: 2,
      match: 3,
      player1: "Player A",
      player2: "Player D",
      score1: 2,
      score2: 0,
      winner: "Player A",
    },
  ];

  // Placeholder standings data
  const placeholderStandings = [
    { rank: 1, player: tournament.winner || "TBD", wins: 10, losses: 2, points: 350 },
    { rank: 2, player: overview.runnerUp || "TBD", wins: 8, losses: 4, points: 320 },
    { rank: 3, player: "Player 3", wins: 7, losses: 5, points: 280 },
    { rank: 4, player: "Player 4", wins: 6, losses: 6, points: 250 },
  ];

  // Placeholder runs data
  const placeholderRuns = [
    { id: 1, player: tournament.winner || "TBD", map: "Tanglewood", score: 45, time: "8:32", date: "2023-08-15" },
    { id: 2, player: overview.runnerUp || "TBD", map: "Bleasdale", score: 42, time: "9:15", date: "2023-08-15" },
    { id: 3, player: "Player 3", map: "Prison", score: 38, time: "10:22", date: "2023-08-14" },
  ];

  return (
    <TourneyPage
      title={tournament.title}
      subtitle={tournament.description}
      breadcrumbs={breadcrumbs}
      badges={[
        { label: tournament.shortTitle, variant: "secondary" },
        { label: tournament.status, variant: "success" },
      ]}
      containerProps={{ className: "py-4" }}
    >
      <Tabs defaultActiveKey="overview" className="mb-4">
        {/* Overview Tab */}
        <Tab eventKey="overview" title="Overview">
          <Row className="g-4">
            <Col md={8}>
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Tournament Information</h5>
                </Card.Header>
                <Card.Body>
                  <p className="lead">{overview.description}</p>
                  
                  <Row className="mt-4">
                    <Col sm={6} className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaTrophy className="text-warning" size={20} />
                        <strong>Format:</strong>
                      </div>
                      <div className="ms-4">{overview.format}</div>
                    </Col>
                    <Col sm={6} className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaCalendar className="text-info" size={20} />
                        <strong>Year:</strong>
                      </div>
                      <div className="ms-4">{overview.year}</div>
                    </Col>
                    <Col sm={6} className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaUsers className="text-primary" size={20} />
                        <strong>Participants:</strong>
                      </div>
                      <div className="ms-4">{overview.participants} players</div>
                    </Col>
                    <Col sm={6} className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaChartBar className="text-success" size={20} />
                        <strong>Total Matches:</strong>
                      </div>
                      <div className="ms-4">{overview.totalMatches}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="shadow-sm mt-4">
                <Card.Header className="bg-secondary text-white">
                  <h5 className="mb-0">Highlights</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {overview.highlights.map((highlight, index) => (
                    <ListGroup.Item key={index}>
                      <Badge bg="primary" className="me-2">{index + 1}</Badge>
                      {highlight}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="shadow-sm bg-success bg-opacity-10 border-success">
                <Card.Header className="bg-success text-white">
                  <FaTrophy className="me-2" />
                  Champion
                </Card.Header>
                <Card.Body className="text-center">
                  <h2 className="display-6 mb-3">{overview.winner}</h2>
                  {overview.runnerUp && (
                    <>
                      <hr />
                      <div className="text-muted">
                        <small>Runner-Up</small>
                      </div>
                      <h4 className="mt-2">{overview.runnerUp}</h4>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Bracket Tab */}
        <Tab eventKey="bracket" title="Bracket">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Tournament Bracket</h5>
            </Card.Header>
            <Card.Body>
              <div className="alert alert-info">
                <strong>Note:</strong> This is a placeholder visualization. Real tournament data will be integrated in a future phase.
              </div>
              <D3Bracket data={placeholderBracketData} width={900} height={500} />
            </Card.Body>
          </Card>
        </Tab>

        {/* Standings Tab */}
        <Tab eventKey="standings" title="Standings">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Final Standings</h5>
            </Card.Header>
            <Card.Body>
              <div className="alert alert-info">
                <strong>Note:</strong> Placeholder data shown. Real standings will be loaded from Firestore in a future phase.
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {placeholderStandings.map((row) => (
                    <tr key={row.rank}>
                      <td>
                        {row.rank === 1 && <FaTrophy className="text-warning me-1" />}
                        {row.rank}
                      </td>
                      <td className={row.rank === 1 ? "fw-bold" : ""}>{row.player}</td>
                      <td>{row.wins}</td>
                      <td>{row.losses}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Runs Tab */}
        <Tab eventKey="runs" title="Recorded Runs">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Tournament Runs</h5>
            </Card.Header>
            <Card.Body>
              <div className="alert alert-info">
                <strong>Note:</strong> Placeholder data shown. Real run data will be loaded from Firestore in a future phase.
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Run ID</th>
                    <th>Player</th>
                    <th>Map</th>
                    <th>Score</th>
                    <th>Time</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {placeholderRuns.map((run) => (
                    <tr key={run.id}>
                      <td>#{run.id}</td>
                      <td>{run.player}</td>
                      <td>{run.map}</td>
                      <td>
                        <Badge bg="primary">{run.score}</Badge>
                      </td>
                      <td>{run.time}</td>
                      <td>{run.date}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </TourneyPage>
  );
}
