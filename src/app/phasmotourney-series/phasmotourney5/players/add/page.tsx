"use client";
import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import { useAuth } from "@/hooks/useAuth";

export default function AddT5PlayerPage() {
  const { admin } = useAuth();
  const [preferredName, setPreferredName] = useState("");
  const [twitch, setTwitch] = useState("");
  const [youtube, setYoutube] = useState("");
  const [steam, setSteam] = useState("");
  const [hours, setHours] = useState("");
  const [prestige, setPrestige] = useState("");
  const [previous, setPrevious] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const breadcrumbs = buildTourneyBreadcrumbs([
    {
      label: "Phasmo Tourney 5",
      href: "/phasmotourney-series/phasmotourney5",
    },
    {
      label: "Players",
      href: "/phasmotourney-series/phasmotourney5/players",
    },
    { label: "Add Player" },
  ]);

  if (!admin)
    return (
      <TourneyPage
        title="Add Player"
        subtitle="Admin access required to extend the Tourney 5 roster."
        breadcrumbs={breadcrumbs}
        badges={[{ label: "Phasmo Tourney 5" }, { label: "Admin" }]}
        actions={[
          {
            label: "Back to roster",
            href: "/phasmotourney-series/phasmotourney5/players",
            variant: "outline-light",
          },
        ]}
        containerProps={{ className: "py-3" }}
      >
        <Alert variant="danger">Admin only</Alert>
      </TourneyPage>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    let res: Response | null = null;
    try {
      res = await fetch("/api/t5/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredName,
          twitch,
          youtube,
          steam,
          phasmoHours: hours ? Number(hours) : undefined,
          prestigeAtAdmission: prestige,
          previousTourney: previous,
        }),
      });
    } catch (fetchErr: any) {
      setErr(`Network error: ${fetchErr?.message || fetchErr}`);
      setLoading(false);
      return;
    }
    if (res.ok) {
      const js = await res.json();
      setMsg(`Player ${js.preferredName} added.`);
      setPreferredName("");
      setTwitch("");
      setYoutube("");
      setSteam("");
      setHours("");
      setPrestige("");
      setPrevious(false);
    } else {
      let detail = "";
      try {
        const j = await res.json();
        detail = j.error || JSON.stringify(j);
      } catch {
        /* ignore parse error */
      }
      setErr(
        `Failed (${res.status}${res.statusText ? " " + res.statusText : ""}): ${
          detail || "No detail from server."
        }`
      );
    }
    setLoading(false);
  }

  return (
    <TourneyPage
      title="Add Player"
      subtitle="Append a new contender to the Phasmo Tourney 5 roster."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 5" }, { label: "Admin" }]}
      actions={[
        {
          label: "Back to roster",
          href: "/phasmotourney-series/phasmotourney5/players",
          variant: "outline-light",
        },
      ]}
      containerProps={{ className: "py-3" }}
    >
      {msg && (
        <Alert variant="success" onClose={() => setMsg(null)} dismissible>
          {msg}
        </Alert>
      )}
      {err && (
        <Alert variant="danger" onClose={() => setErr(null)} dismissible>
          {err}
        </Alert>
      )}
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={submit}>
            <Form.Group className="mb-2">
              <Form.Label className="small">Preferred Name *</Form.Label>
              <Form.Control
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small">Twitch Handle</Form.Label>
              <Form.Control
                value={twitch}
                onChange={(e) => setTwitch(e.target.value)}
                disabled={loading}
                placeholder="dukesenior"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small">YouTube Handle</Form.Label>
              <Form.Control
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small">Steam Username</Form.Label>
              <Form.Control
                value={steam}
                onChange={(e) => setSteam(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small">Phasmo Total Hours</Form.Label>
              <Form.Control
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                type="number"
                min={0}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small">
                Prestige Level at Admission
              </Form.Label>
              <Form.Control
                value={prestige}
                onChange={(e) => setPrestige(e.target.value)}
                disabled={loading}
                placeholder="e.g. Prestige 5"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Participated in previous tourney"
                checked={previous}
                onChange={(e) => setPrevious(e.target.checked)}
                disabled={loading}
              />
            </Form.Group>
            <Button type="submit" disabled={!preferredName || loading}>
              Add Player
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </TourneyPage>
  );
}
