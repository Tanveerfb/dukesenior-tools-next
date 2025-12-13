"use client";
import { useEffect, useState } from "react";
import { Card, Form, Button, Table, Stack } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { useCmsUploads } from "@/hooks/useCmsUploads";
import {
  addRound4TwitchPollRecord,
  listRound4TwitchPollRecords,
} from "@/lib/services/phasmoTourney5";

interface PollRecord {
  id: string;
  playerId: string;
  opponentId: string;
  matchNumber: number;
  pollSummary: string;
  imageUrl?: string;
  officer: string;
  createdAt: number;
}

export default function TwitchPollResultsCard() {
  const { user } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const { uploadImages } = useCmsUploads();
  const [players, setPlayers] = useState<Array<{ id: string; name: string }>>(
    []
  );

  const [form, setForm] = useState<{
    matchNumber: string;
    playerId: string;
    opponentId: string;
    pollSummary: string;
    imageFile?: File | null;
  }>({
    matchNumber: "",
    playerId: "",
    opponentId: "",
    pollSummary: "",
    imageFile: null,
  });
  const [records, setRecords] = useState<PollRecord[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await listRound4TwitchPollRecords();
        setRecords(
          list.map((r) => ({
            id: r.id,
            officer: r.officer,
            matchNumber: r.matchNumber,
            playerId: r.playerId,
            opponentId: r.opponentId,
            pollSummary: r.pollSummary,
            imageUrl: r.imageUrl,
            createdAt: r.createdAt,
          }))
        );
      } catch {}
    })();
  }, []);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const matchNumber = Number(form.matchNumber);
    if (!isFinite(matchNumber) || !form.playerId || !form.opponentId) return;
    let imageUrl: string | undefined = undefined;
    if (form.imageFile) {
      await uploadImages([form.imageFile], (url) => {
        imageUrl = url;
      });
    }
    const id = await addRound4TwitchPollRecord({
      officer,
      matchNumber,
      playerId: form.playerId,
      opponentId: form.opponentId,
      pollSummary: form.pollSummary,
      imageUrl,
    });
    const list = await listRound4TwitchPollRecords();
    setRecords(
      list.map((r) => ({
        id: r.id,
        officer: r.officer,
        matchNumber: r.matchNumber,
        playerId: r.playerId,
        opponentId: r.opponentId,
        pollSummary: r.pollSummary,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt,
      }))
    );
    setForm({
      matchNumber: "",
      playerId: "",
      opponentId: "",
      pollSummary: "",
      imageFile: null,
    });
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <Card.Title as="h2" className="h5 fw-semibold">
          Twitch Poll Results
        </Card.Title>
        <Form onSubmit={submit} className="mt-3">
          <Stack direction="horizontal" gap={3} className="flex-wrap">
            <Form.Group>
              <Form.Label>Match #</Form.Label>
              <Form.Control
                type="number"
                value={form.matchNumber}
                onChange={(e) =>
                  setForm({ ...form, matchNumber: e.target.value })
                }
                min="1"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Player</Form.Label>
              <Form.Select
                value={form.playerId}
                onChange={(e) => setForm({ ...form, playerId: e.target.value })}
              >
                <option value="">Select player…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Opponent</Form.Label>
              <Form.Select
                value={form.opponentId}
                onChange={(e) =>
                  setForm({ ...form, opponentId: e.target.value })
                }
              >
                <option value="">Select opponent…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>Poll Summary</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.pollSummary}
                onChange={(e) =>
                  setForm({ ...form, pollSummary: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Screenshot</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, imageFile: file || null });
                }}
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Stack>
        </Form>

        <Table responsive size="sm" className="mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Match</th>
              <th>Player</th>
              <th>Opponent</th>
              <th>Officer</th>
              <th>Time</th>
              <th>Poll</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{r.matchNumber}</td>
                <td>{r.playerId}</td>
                <td>{r.opponentId}</td>
                <td className="text-muted small">{r.officer}</td>
                <td className="text-muted small">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="text-muted small">{r.pollSummary}</td>
                <td>
                  {r.imageUrl ? (
                    <a href={r.imageUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={8} className="text-muted">
                  No poll records yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
