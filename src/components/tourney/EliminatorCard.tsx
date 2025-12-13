"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import {
  addEliminatorSession,
  listEliminatorSessions,
} from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}

export default function EliminatorCard({
  playerCountOptions = [2, 3, 5],
}: {
  playerCountOptions?: number[];
}) {
  const { user } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [challenger, setChallenger] = useState<string>("");
  const [defender, setDefender] = useState<string>("");
  const [winner, setWinner] = useState<string>("");
  const [playerCount, setPlayerCount] = useState<number>(
    playerCountOptions[0] || 2
  );
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      challengerId: string;
      defenderId: string;
      winnerId: string;
      officer: string;
      createdAt: number;
    }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/phasmoTourney5/players");
        const json = await res.json();
        setPlayers(
          Array.isArray(json)
            ? json.filter((p: any) => p.status !== "Eliminated")
            : []
        );
      } catch {}
      try {
        const list = await listEliminatorSessions();
        setSessions(list);
      } catch {}
    })();
  }, []);

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const winnerOptions = useMemo(() => {
    if (playerCount === 2) return [challenger, defender].filter(Boolean);
    return selectedPlayers.filter(Boolean);
  }, [playerCount, challenger, defender, selectedPlayers]);

  async function submitEliminator(e: React.FormEvent) {
    e.preventDefault();
    if (playerCount === 2) {
      if (!challenger || !defender || !winner) return;
      await addEliminatorSession({
        officer,
        challengerId: challenger,
        defenderId: defender,
        winnerId: winner,
        playerCount,
      });
    } else {
      if (selectedPlayers.length !== playerCount || !winner) return;
      await addEliminatorSession({
        officer,
        challengerId: selectedPlayers[0],
        defenderId: selectedPlayers[1],
        winnerId: winner,
        playerCount,
      });
    }
    const list = await listEliminatorSessions();
    setSessions(list);
    setChallenger("");
    setDefender("");
    setWinner("");
    setSelectedPlayers([]);
  }

  function playerName(id: string) {
    return players.find((p) => p.id === id)?.name || id;
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <Card.Title as="h2" className="h5 fw-semibold">
          Eliminator
        </Card.Title>
        <Form onSubmit={submitEliminator} className="mt-2">
          <Row className="g-3">
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Officer</Form.Label>
                <Form.Control value={officer} disabled />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Number of players</Form.Label>
                <Form.Select
                  value={String(playerCount)}
                  onChange={(e) => setPlayerCount(Number(e.target.value))}
                >
                  {playerCountOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            {playerCount === 2 ? (
              <>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Defender</Form.Label>
                    <Form.Select
                      value={defender}
                      onChange={(e) => setDefender(e.target.value)}
                      required
                    >
                      <option value="">Select player…</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Challenger</Form.Label>
                    <Form.Select
                      value={challenger}
                      onChange={(e) => setChallenger(e.target.value)}
                      required
                    >
                      <option value="">Select player…</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            ) : (
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Players</Form.Label>
                  <div className="d-flex gap-2 flex-wrap">
                    {Array.from({ length: playerCount }).map((_, idx) => (
                      <Form.Select
                        key={idx}
                        className="flex-grow-1"
                        value={selectedPlayers[idx] || ""}
                        onChange={(e) => {
                          const next = [...selectedPlayers];
                          next[idx] = e.target.value;
                          setSelectedPlayers(next);
                        }}
                      >
                        <option value="">Player {idx + 1}</option>
                        {players.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </Form.Select>
                    ))}
                  </div>
                </Form.Group>
              </Col>
            )}
            <Row>
              <Form.Group className="mb-3">
                <Form.Label>Winner (manual)</Form.Label>
                <Form.Select
                  value={winner}
                  onChange={(e) => setWinner(e.target.value)}
                  required
                >
                  <option value="">Select winner…</option>
                  {winnerOptions.map((pid) => (
                    <option key={pid} value={pid}>
                      {playerName(pid)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>
          </Row>
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setChallenger("");
                setDefender("");
                setWinner("");
              }}
            >
              Reset
            </Button>
          </div>
        </Form>

        <Table responsive size="sm" className="mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Challenger</th>
              <th>Defender</th>
              <th>Winner</th>
              <th>Officer</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{playerName(s.challengerId)}</td>
                <td>{playerName(s.defenderId)}</td>
                <td>{playerName(s.winnerId)}</td>
                <td className="text-muted small">{s.officer}</td>
                <td className="text-muted small">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">
                  No eliminator sessions yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
