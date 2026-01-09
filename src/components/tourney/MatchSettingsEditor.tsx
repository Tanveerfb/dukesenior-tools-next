"use client";
import { useEffect, useMemo, useState } from "react";
import { Accordion, Form } from "react-bootstrap";
import GameSettingsAdminEditor from "./GameSettingsAdminEditor";

export default function MatchSettingsEditor({
  matchNumber,
}: {
  matchNumber: number;
}) {
  const roundId = `round4-match-${matchNumber}`;
  const [players, setPlayers] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [p1, setP1] = useState<string>("");
  const [p2, setP2] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/phasmoTourney5/players");
        const json = await res.json();
        const list = Array.isArray(json)
          ? json
              .filter((p: any) => p.status !== "Eliminated")
              .map((p: any) => ({ id: p.id, name: p.name }))
          : [];
        setPlayers(list);
      } catch {}
    })();
  }, []);

  const title = useMemo(() => {
    const p1n = players.find((x) => x.id === p1)?.name || "Player 1";
    const p2n = players.find((x) => x.id === p2)?.name || "Player 2";
    return `Match ${matchNumber}: ${p1n} vs ${p2n}`;
  }, [players, p1, p2, matchNumber]);

  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey={`match-${matchNumber}`}>
        <Accordion.Header>{title}</Accordion.Header>
        <Accordion.Body>
          <div className="d-flex gap-3 flex-wrap mb-3">
            <Form.Group>
              <Form.Label>Player 1</Form.Label>
              <Form.Select value={p1} onChange={(e) => setP1(e.target.value)}>
                <option value="">Select player…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Player 2</Form.Label>
              <Form.Select value={p2} onChange={(e) => setP2(e.target.value)}>
                <option value="">Select player…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          <GameSettingsAdminEditor roundId={roundId} />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
