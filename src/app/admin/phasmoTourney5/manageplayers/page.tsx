"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Stack,
  Table,
} from "react-bootstrap";
import * as ct from "countries-and-timezones";
import { formatNowInTimezone } from "@/lib/utils/time";

interface Player {
  id: string;
  name: string;
  twitch: string;
  youtube?: string;
  discord: string;
  prestige: string; // I to XX
  timezone: string;
  uid?: string; // optional link to auth user
  auditionDone: boolean;
  immune: boolean;
  status: "Active" | "Inactive" | "Eliminated";
}

const romanPrestige = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
];

function getTimezones(): string[] {
  // Prefer countries-and-timezones authoritative list
  const all = ct.getAllTimezones();
  const tzs = Object.keys(all);
  if (tzs.length) return tzs.sort();
  // Fallback to Intl if package fails
  try {
    // @ts-expect-error - supportedValuesOf may not exist in older environments
    const vals = Intl.supportedValuesOf?.("timeZone");
    if (Array.isArray(vals) && vals.length) return vals;
  } catch {}
  return ["UTC"]; // minimal fallback
}

export default function ManagePlayersPage() {
  const { admin } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImmunModal, setShowImmunModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [liveTime, setLiveTime] = useState<{ [key: string]: string }>({});
  const timezones = useMemo(() => getTimezones(), []);
  // Teams management moved to round-specific pages (Round 3 & 6)

  const [form, setForm] = useState<{
    name: string;
    twitch: string;
    youtube: string;
    discord: string;
    prestige: string;
    timezone: string;
    uid: string;
    auditionDone: boolean;
    immune: boolean;
    status: "Active" | "Inactive" | "Eliminated";
  }>({
    name: "",
    twitch: "",
    youtube: "",
    discord: "",
    prestige: "I",
    timezone: "UTC",
    uid: "",
    auditionDone: false,
    immune: false,
    status: "Active",
  });

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/phasmoTourney5/players");
        if (!res.ok) throw new Error(`Failed to load players: ${res.status}`);
        const data = await res.json();
        setPlayers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load players");
      } finally {
        setLoading(false);
      }
    }
    if (admin) fetchPlayers();
  }, [admin]);

  // Removed global teams fetching; teams are managed per-round

  // Live time updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes: { [key: string]: string } = {};
      players.forEach((p) => {
        newTimes[p.id] = formatNowInTimezone(p.timezone);
      });
      setLiveTime(newTimes);
    }, 1000);
    return () => clearInterval(interval);
  }, [players]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Simple client validations per requirements
    if (!form.name.trim()) return setError("Name is required");
    if (!form.twitch.trim()) return setError("Twitch handle is required");
    if (!form.discord.trim()) return setError("Discord handle is required");
    if (!romanPrestige.includes(form.prestige))
      return setError("Prestige must be I to XX");
    if (!form.timezone) return setError("Timezone is required");

    try {
      const res = await fetch("/api/admin/phasmoTourney5/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          twitch: form.twitch.trim(),
          youtube: form.youtube.trim() || undefined,
          discord: form.discord.trim(),
          prestige: form.prestige,
          timezone: form.timezone,
          uid: form.uid?.trim() || undefined,
          auditionDone: form.auditionDone,
          immune: form.immune,
          status: form.status,
        }),
      });
      if (!res.ok) {
        let msg = `Failed to add player: ${res.status}`;
        try {
          const err = await res.json();
          if (err?.error) msg = err.error;
        } catch {}
        throw new Error(msg);
      }
      const created: Player = await res.json();
      setPlayers((prev) => [created, ...prev]);
      setForm({
        name: "",
        twitch: "",
        youtube: "",
        discord: "",
        prestige: "I",
        timezone: "UTC",
        uid: "",
        auditionDone: false,
        immune: false,
        status: "Active",
      });
    } catch (e: any) {
      setError(e?.message || "Failed to add player");
    }
  }

  if (!admin) {
    return (
      <Container className="py-4">
        <Alert variant="warning" className="mb-0">
          Admin access required.{" "}
          <Link href="/login" className="alert-link">
            Log in
          </Link>
        </Alert>
      </Container>
    );
  }

  async function handleEditPlayer(updatedData: Partial<Player>) {
    if (!selectedPlayer) return;
    try {
      const res = await fetch(
        `/api/admin/phasmoTourney5/players/${selectedPlayer.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      if (!res.ok) throw new Error(`Failed to update player: ${res.status}`);
      const updated: Player = await res.json();
      setPlayers((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setShowEditModal(false);
      setSelectedPlayer(null);
    } catch (e: any) {
      setError(e?.message || "Failed to update player");
    }
  }

  async function handleToggleImmune() {
    if (!selectedPlayer) return;
    await handleEditPlayer({ immune: !selectedPlayer.immune });
    setShowImmunModal(false);
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 fw-semibold mb-0">Manage Players</h1>
        <Stack direction="horizontal" gap={2} className="mb-3">
          {/* Teams management is handled in Round 3 and Round 6 */}
          <Button
            as={Link as any}
            href="/admin/phasmoTourney5/manageeliminator"
            variant="outline-secondary"
          >
            Manage Eliminator
          </Button>
        </Stack>
        <Button
          variant={showAddForm ? "secondary" : "primary"}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add Player"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Card.Title as="h2" className="h5 fw-semibold">
              Add New Player
            </Card.Title>
            <Form onSubmit={handleSubmit} className="mt-3">
              {error && (
                <Alert
                  variant="danger"
                  onClose={() => setError(null)}
                  dismissible
                >
                  {error}
                </Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Twitch handle *</Form.Label>
                <Form.Control
                  value={form.twitch}
                  onChange={(e) => setForm({ ...form, twitch: e.target.value })}
                  required
                  placeholder="e.g., DukeSenior"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Youtube handle</Form.Label>
                <Form.Control
                  value={form.youtube}
                  onChange={(e) =>
                    setForm({ ...form, youtube: e.target.value })
                  }
                  placeholder="optional"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discord handle *</Form.Label>
                <Form.Control
                  value={form.discord}
                  onChange={(e) =>
                    setForm({ ...form, discord: e.target.value })
                  }
                  required
                  placeholder="e.g., User#1234 or @user"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Prestige *</Form.Label>
                <Form.Select
                  value={form.prestige}
                  onChange={(e) =>
                    setForm({ ...form, prestige: e.target.value })
                  }
                >
                  {romanPrestige.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Timezone *</Form.Label>
                <Form.Control
                  type="text"
                  list="timezone-list"
                  placeholder="Start typing: e.g., America/New_York"
                  value={form.timezone}
                  onChange={(e) =>
                    setForm({ ...form, timezone: e.target.value })
                  }
                  required
                />
                <datalist id="timezone-list">
                  {timezones.map((tz) => (
                    <option key={tz} value={tz} />
                  ))}
                </datalist>
                <Form.Text className="text-muted">
                  Type to search; pick a suggested timezone.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Link Auth UID (optional)</Form.Label>
                <Form.Control
                  value={form.uid}
                  onChange={(e) => setForm({ ...form, uid: e.target.value })}
                  placeholder="Paste Firebase UID to link player"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Audition done?"
                  checked={form.auditionDone}
                  onChange={(e) =>
                    setForm({ ...form, auditionDone: e.target.checked })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status *</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as
                        | "Active"
                        | "Inactive"
                        | "Eliminated",
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Eliminated">Eliminated</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Immune?"
                  checked={form.immune}
                  onChange={(e) =>
                    setForm({ ...form, immune: e.target.checked })
                  }
                />
              </Form.Group>
              <Stack direction="horizontal" gap={3}>
                <Button type="submit" variant="primary">
                  Add Player
                </Button>
              </Stack>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Card.Title as="h2" className="h5 fw-semibold">
            Players
          </Card.Title>
          {loading ? (
            <div className="text-muted">Loading…</div>
          ) : (
            <Table responsive size="sm" className="mt-3">
              <thead>
                <tr>
                  <th style={{ width: "3%" }}>#</th>
                  <th>Name</th>
                  <th>Twitch</th>
                  <th>Discord</th>
                  <th>Prestige</th>
                  <th>Status</th>
                  <th style={{ width: "5%" }}>Immune</th>
                  <th>Local Time</th>
                  <th style={{ width: "10%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{idx + 1}</td>
                    <td>{p.name}</td>
                    <td>
                      <a
                        href={`https://twitch.tv/${p.twitch}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {p.twitch}
                      </a>
                    </td>
                    <td>{p.discord}</td>
                    <td>{p.prestige}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === "Active"
                            ? "bg-success"
                            : p.status === "Inactive"
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant={p.immune ? "warning" : "outline-secondary"}
                        onClick={() => {
                          setSelectedPlayer(p);
                          setShowImmunModal(true);
                        }}
                        title={
                          p.immune
                            ? "Player is immune"
                            : "Click to toggle immune"
                        }
                      >
                        {p.immune ? "🛡️" : "—"}
                      </Button>
                    </td>
                    <td className="text-muted small">
                      {liveTime[p.id] || "—"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          setSelectedPlayer(p);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="ms-2"
                        onClick={async () => {
                          const confirmed = window.confirm(
                            `Delete player "${p.name}"? This can be undone only by re-adding.`
                          );
                          if (!confirmed) return;
                          try {
                            const res = await fetch(
                              `/api/admin/phasmoTourney5/players/${p.id}`,
                              { method: "DELETE" }
                            );
                            if (!res.ok)
                              throw new Error(
                                `Failed to delete player: ${res.status}`
                              );
                            setPlayers((prev) =>
                              prev.filter((x) => x.id !== p.id)
                            );
                          } catch (e: any) {
                            setError(e?.message || "Failed to delete player");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-muted">
                      No players yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Edit Player Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Player: {selectedPlayer?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPlayer && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={selectedPlayer.name}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      name: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Twitch</Form.Label>
                <Form.Control
                  value={selectedPlayer.twitch}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      twitch: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Youtube</Form.Label>
                <Form.Control
                  value={selectedPlayer.youtube || ""}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      youtube: e.target.value || undefined,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discord</Form.Label>
                <Form.Control
                  value={selectedPlayer.discord}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      discord: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Prestige</Form.Label>
                <Form.Select
                  value={selectedPlayer.prestige}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      prestige: e.target.value,
                    })
                  }
                >
                  {romanPrestige.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Timezone</Form.Label>
                <Form.Control
                  type="text"
                  list="timezone-list-edit"
                  value={selectedPlayer.timezone}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      timezone: e.target.value,
                    })
                  }
                />
                <datalist id="timezone-list-edit">
                  {timezones.map((tz) => (
                    <option key={tz} value={tz} />
                  ))}
                </datalist>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={selectedPlayer.status}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      status: e.target.value as
                        | "Active"
                        | "Inactive"
                        | "Eliminated",
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Eliminated">Eliminated</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Audition done?"
                  checked={selectedPlayer.auditionDone}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      auditionDone: e.target.checked,
                    })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (selectedPlayer) {
                handleEditPlayer({
                  name: selectedPlayer.name,
                  twitch: selectedPlayer.twitch,
                  youtube: selectedPlayer.youtube,
                  discord: selectedPlayer.discord,
                  prestige: selectedPlayer.prestige,
                  timezone: selectedPlayer.timezone,
                  status: selectedPlayer.status,
                  auditionDone: selectedPlayer.auditionDone,
                });
              }
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Immune Toggle Confirmation Modal */}
      <Modal show={showImmunModal} onHide={() => setShowImmunModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Immune Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to{" "}
            <strong>
              {selectedPlayer?.immune ? "remove" : "grant"} immunity
            </strong>{" "}
            for <strong>{selectedPlayer?.name}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImmunModal(false)}>
            Cancel
          </Button>
          <Button
            variant={selectedPlayer?.immune ? "warning" : "success"}
            onClick={handleToggleImmune}
          >
            {selectedPlayer?.immune ? "Remove Immunity" : "Grant Immunity"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Teams management removed; handled per-round */}
    </Container>
  );
}
