"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Alert,
  Card,
  Badge,
  Stack,
  Spinner,
  Button,
  ButtonGroup,
} from "react-bootstrap";
import { listEliminatorSessions } from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
  immune: boolean;
}

interface Session {
  id: string;
  name: string;
  type: "vote-out" | "pick-ally";
  closed: boolean;
  createdAt: number;
  closedAt?: number;
}

interface Vote {
  choicePlayerId: string;
}

interface EliminatorSession {
  id: string;
  challengerId: string;
  defenderId: string;
  winnerId: string;
  createdAt: number;
}

interface RoundEvent {
  type: "eliminator" | "vote" | "immunity";
  timestamp: number;
  description: string;
  details?: any;
}

export default function Tourney5TimelinePage() {
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [eliminatorSessions, setEliminatorSessions] = useState<
    EliminatorSession[]
  >([]);
  const [votesBySession, setVotesBySession] = useState<
    Record<string, Vote[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rounds = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    (async () => {
      try {
        const [playersRes, sessionsRes, eliminatorData] = await Promise.all([
          fetch("/api/admin/phasmoTourney5/players"),
          fetch("/api/admin/phasmoTourney5/votesessions"),
          listEliminatorSessions(),
        ]);
        const p = await playersRes.json();
        const s = await sessionsRes.json();

        setPlayers(Array.isArray(p) ? p : []);
        const sessionsList = Array.isArray(s) ? s : [];
        setSessions(sessionsList);
        setEliminatorSessions(eliminatorData);

        // Load votes for closed sessions
        const closedSessions = sessionsList.filter(
          (sess: Session) => sess.closed
        );
        const votesData: Record<string, Vote[]> = {};
        await Promise.all(
          closedSessions.map(async (sess: Session) => {
            try {
              const res = await fetch(
                `/api/phasmoTourney5/votesessions/${sess.id}/vote`
              );
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

  function getTopVotedPlayer(votes: Vote[]): string | null {
    if (votes.length === 0) return null;
    const tally: Record<string, number> = {};
    for (const v of votes) {
      tally[v.choicePlayerId] = (tally[v.choicePlayerId] || 0) + 1;
    }
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  }

  function getRoundEvents(round: number): RoundEvent[] {
    const events: RoundEvent[] = [];

    // TODO: Store round info in eliminator sessions for proper filtering
    // Currently showing all eliminator events since round data not tracked
    eliminatorSessions.forEach((session) => {
      events.push({
        type: "eliminator",
        timestamp: session.createdAt,
        description: `${getPlayerName(session.challengerId)} challenged ${getPlayerName(session.defenderId)}`,
        details: {
          winner: getPlayerName(session.winnerId),
          challenger: getPlayerName(session.challengerId),
          defender: getPlayerName(session.defenderId),
        },
      });
    });

    // Add vote events
    sessions
      .filter((s) => s.closed)
      .forEach((session) => {
        const votes = votesBySession[session.id] || [];
        const topPlayer = getTopVotedPlayer(votes);
        if (session.type === "vote-out" && topPlayer) {
          events.push({
            type: "vote",
            timestamp: session.closedAt || session.createdAt,
            description: `${getPlayerName(topPlayer)} was voted out`,
            details: {
              sessionName: session.name,
              totalVotes: votes.length,
            },
          });
        } else if (session.type === "pick-ally") {
          events.push({
            type: "vote",
            timestamp: session.closedAt || session.createdAt,
            description: `Ally selection: ${session.name}`,
            details: {
              sessionName: session.name,
              totalVotes: votes.length,
            },
          });
        }
      });

    // Sort by timestamp
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  if (loading) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">Phasmo Tourney 5 — Timeline</h1>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">Phasmo Tourney 5 — Timeline</h1>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const roundEvents = getRoundEvents(selectedRound);
  const immunePlayers = players.filter((p) => p.immune && p.status === "Active");

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Phasmo Tourney 5 — Timeline</h1>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 mb-3">
            Select Round
          </Card.Title>
          <ButtonGroup className="flex-wrap">
            {rounds.map((round) => (
              <Button
                key={round}
                variant={selectedRound === round ? "primary" : "outline-primary"}
                onClick={() => setSelectedRound(round)}
              >
                Round {round}
              </Button>
            ))}
          </ButtonGroup>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h5 mb-3">
            Current Immune Players
          </Card.Title>
          {immunePlayers.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No players are currently immune.
            </Alert>
          ) : (
            <div className="d-flex gap-2 flex-wrap">
              {immunePlayers.map((player) => (
                <Badge key={player.id} bg="warning" text="dark" className="px-3 py-2">
                  {player.name}
                </Badge>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="h5 mb-3">
            Round {selectedRound} Events
          </Card.Title>
          {roundEvents.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No events recorded for Round {selectedRound} yet.
            </Alert>
          ) : (
            <Stack gap={3}>
              {roundEvents.map((event, idx) => (
                <Card key={idx} className="border">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge
                        bg={
                          event.type === "eliminator"
                            ? "danger"
                            : event.type === "vote"
                            ? "warning"
                            : "info"
                        }
                        text={event.type === "eliminator" ? "light" : "dark"}
                      >
                        {event.type === "eliminator"
                          ? "Eliminator Challenge"
                          : event.type === "vote"
                          ? "Vote Session"
                          : "Immunity"}
                      </Badge>
                      <span className="text-muted small">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-1">{event.description}</div>
                    {event.details && event.type === "eliminator" && (
                      <div className="small text-muted">
                        Winner: <span className="text-success fw-semibold">{event.details.winner}</span>
                      </div>
                    )}
                    {event.details && event.type === "vote" && (
                      <div className="small text-muted">
                        Total votes: {event.details.totalVotes}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
