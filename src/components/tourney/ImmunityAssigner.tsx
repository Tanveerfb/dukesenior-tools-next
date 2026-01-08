"use client";
import { useEffect, useState } from "react";
import { Card, Form, Button, Stack, Alert } from "react-bootstrap";

interface Player {
  id: string;
  name: string;
  immune: boolean;
  status: "Active" | "Inactive" | "Eliminated";
}

export default function ImmunityAssigner({
  roundLabel,
}: {
  roundLabel?: string;
}) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  async function loadPlayers() {
    try {
      const res = await fetch("/api/admin/phasmoTourney5/players");
      const json = await res.json();
      const list = Array.isArray(json)
        ? json
            .filter((p: any) => p.status !== "Eliminated")
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              immune: !!p.immune,
              status: p.status,
            }))
        : [];
      setPlayers(list);
    } catch (_e) {
      setMessage("Failed to load players");
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  async function assignImmunity(val: boolean) {
    if (!selected) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/phasmoTourney5/players/${selected}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immune: val }),
      });
      if (!res.ok) throw new Error("Failed to update immunity");
      setMessage(val ? "Immunity assigned." : "Immunity removed.");
      await loadPlayers();
    } catch (e: any) {
      setMessage(e?.message || "Failed to update immunity");
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <Card.Title as="h2" className="h6 fw-semibold">
          Immunity Assigner{roundLabel ? ` — ${roundLabel}` : ""}
        </Card.Title>
        <Stack direction="horizontal" gap={3} className="flex-wrap mt-2">
          <Form.Group>
            <Form.Label>Active Player</Form.Label>
            <Form.Select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Select player…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.immune ? "(immune)" : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button
            variant="primary"
            onClick={() => assignImmunity(true)}
            disabled={!selected}
          >
            Assign Immunity
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => assignImmunity(false)}
            disabled={!selected}
          >
            Remove Immunity
          </Button>
        </Stack>
        <Alert variant="light" className="mt-3">
          Immunity lasts one turn (until end of next elimination).
        </Alert>
        {message && <div className="mt-2 text-muted">{message}</div>}
      </Card.Body>
    </Card>
  );
}
