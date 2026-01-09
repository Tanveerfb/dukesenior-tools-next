"use client";
import { useEffect, useState } from "react";
import { Container, Alert, Table, Badge, Card, Spinner, Stack } from "react-bootstrap";

interface Player {
  id: string;
  name: string;
}

interface Session {
  id: string;
  name: string;
  type: "vote-out" | "pick-ally";
  anonymous: boolean;
  closed: boolean;
  createdAt: number;
  closedAt?: number;
}

interface Vote {
  id: string;
  sessionId: string;
  voterUid: string;
  voterName: string;
  choicePlayerId: string;
  createdAt: number;
}

export default function Tourney5VoteSessionsDataPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [votesBySession, setVotesBySession] = useState<Record<string, Vote[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [playersRes, sessionsRes] = await Promise.all([
          fetch("/api/admin/phasmoTourney5/players"),
          fetch("/api/admin/phasmoTourney5/votesessions"),
        ]);
        const p = await playersRes.json();
        const s = await sessionsRes.json();
        setPlayers(Array.isArray(p) ? p : []);
        const sessionsList = Array.isArray(s) ? s : [];
        setSessions(sessionsList);

        // Load votes for all closed sessions
        const closedSessions = sessionsList.filter((sess: Session) => sess.closed);
        const votesData: Record<string, Vote[]> = {};
        await Promise.all(
          closedSessions.map(async (sess: Session) => {
            try {
              const res = await fetch(`/api/phasmoTourney5/votesessions/${sess.id}/vote`);
              const v = await res.json();
              votesData[sess.id] = Array.isArray(v) ? v : [];
            } catch {
              votesData[sess.id] = [];
            }
          })
        );
        setVotesBySession(votesData);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function getPlayerName(playerId: string): string {
    return players.find((p) => p.id === playerId)?.name || playerId;
  }

  function computeTally(votes: Vote[]): Array<{ playerId: string; count: number }> {
    const tally: Record<string, number> = {};
    for (const v of votes) {
      tally[v.choicePlayerId] = (tally[v.choicePlayerId] || 0) + 1;
    }
    return Object.entries(tally)
      .map(([playerId, count]) => ({ playerId, count }))
      .sort((a, b) => b.count - a.count);
  }

  if (loading) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">
          Phasmo Tourney 5 — Vote Sessions Data
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
          Phasmo Tourney 5 — Vote Sessions Data
        </h1>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const closedSessions = sessions
    .filter((s) => s.closed)
    .sort((a, b) => (b.closedAt || b.createdAt) - (a.closedAt || a.createdAt));

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">
        Phasmo Tourney 5 — Vote Sessions Data
      </h1>
      {closedSessions.length === 0 ? (
        <Alert variant="info">No closed vote sessions yet.</Alert>
      ) : (
        <Stack gap={3}>
          {closedSessions.map((session) => {
            const votes = votesBySession[session.id] || [];
            const tally = computeTally(votes);
            const topChoice = tally[0];
            return (
              <Card key={session.id} className="shadow-sm">
                <Card.Body>
                  <Card.Title as="h2" className="h5 mb-2">
                    {session.name}
                  </Card.Title>
                  <div className="d-flex gap-2 mb-3">
                    <Badge bg={session.type === "vote-out" ? "danger" : "success"}>
                      {session.type === "vote-out" ? "Vote Out" : "Pick Ally"}
                    </Badge>
                    <Badge bg="secondary">
                      {session.anonymous ? "Anonymous" : "Public"}
                    </Badge>
                    <Badge bg="info">{votes.length} votes</Badge>
                  </div>
                  {votes.length === 0 ? (
                    <Alert variant="secondary" className="mb-0 small">
                      No votes recorded.
                    </Alert>
                  ) : (
                    <>
                      {topChoice && (
                        <div className="mb-3 p-3 border rounded bg-light">
                          <div className="fw-semibold">
                            {session.type === "vote-out" ? "Voted Out:" : "Most Selected:"}
                          </div>
                          <div className="display-6 text-primary">
                            {getPlayerName(topChoice.playerId)}
                          </div>
                          <div className="text-muted">
                            {topChoice.count} vote{topChoice.count !== 1 ? "s" : ""}
                          </div>
                        </div>
                      )}
                      <h3 className="h6 mb-2">Vote Breakdown</h3>
                      <Table size="sm" responsive hover>
                        <thead>
                          <tr>
                            <th>Player</th>
                            <th>Votes</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tally.map(({ playerId, count }) => (
                            <tr key={playerId}>
                              <td className="fw-semibold">
                                {getPlayerName(playerId)}
                              </td>
                              <td>{count}</td>
                              <td className="text-muted">
                                {((count / votes.length) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                  <div className="text-muted small mt-2">
                    Closed on{" "}
                    {new Date(session.closedAt || session.createdAt).toLocaleString()}
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
