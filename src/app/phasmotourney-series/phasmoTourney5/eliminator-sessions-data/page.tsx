"use client";
import { useEffect, useState } from "react";
import { Container, Alert, Table, Badge, Card, Spinner } from "react-bootstrap";
import { listEliminatorSessions } from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
}

interface EliminatorSession {
  id: string;
  challengerId: string;
  defenderId: string;
  winnerId: string;
  officer: string;
  createdAt: number;
  playerCount?: number | null;
}

export default function Tourney5EliminatorSessionsDataPage() {
  const [sessions, setSessions] = useState<EliminatorSession[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sessionsData, playersRes] = await Promise.all([
          listEliminatorSessions(),
          fetch("/api/admin/phasmoTourney5/players"),
        ]);
        const playersData = await playersRes.json();
        setSessions(sessionsData);
        setPlayers(Array.isArray(playersData) ? playersData : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function getPlayerName(playerId: string): string {
    return players.find((p) => p.id === playerId)?.name || playerId;
  }

  if (loading) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">
          Phasmo Tourney 5 — Eliminator Sessions Data
        </h1>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">
          Phasmo Tourney 5 — Eliminator Sessions Data
        </h1>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Sort by most recent first
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">
        Phasmo Tourney 5 — Eliminator Sessions Data
      </h1>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="h5 mb-3">
            Challenge History ({sessions.length} total)
          </Card.Title>
          {sessions.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No eliminator sessions recorded yet.
            </Alert>
          ) : (
            <Table responsive hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Challenger</th>
                  <th>Defender</th>
                  <th>Winner</th>
                  <th>Players Remaining</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedSessions.map((session, idx) => (
                  <tr key={session.id}>
                    <td>{sortedSessions.length - idx}</td>
                    <td>
                      <span
                        className={
                          session.winnerId === session.challengerId
                            ? "fw-semibold text-success"
                            : ""
                        }
                      >
                        {getPlayerName(session.challengerId)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          session.winnerId === session.defenderId
                            ? "fw-semibold text-success"
                            : ""
                        }
                      >
                        {getPlayerName(session.defenderId)}
                      </span>
                    </td>
                    <td>
                      <Badge bg="success">
                        {getPlayerName(session.winnerId)}
                      </Badge>
                    </td>
                    <td>
                      {session.playerCount !== null &&
                      session.playerCount !== undefined
                        ? session.playerCount
                        : "—"}
                    </td>
                    <td className="text-muted small">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
