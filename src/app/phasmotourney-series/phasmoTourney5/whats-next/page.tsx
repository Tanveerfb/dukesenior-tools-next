"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Alert,
  Card,
  Badge,
  Spinner,
  Stack,
} from "react-bootstrap";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
  immune: boolean;
}

interface RoundSettings {
  roundId: string;
  roundName?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export default function Tourney5WhatsNextPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [roundSettings, setRoundSettings] = useState<RoundSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Load players to show immune status
        const playersRes = await fetch("/api/admin/phasmoTourney5/players");
        const p = await playersRes.json();
        setPlayers(Array.isArray(p) ? p : []);

        // Try to load upcoming round settings (you can change roundId based on current state)
        // For now, we'll try to fetch round1 settings as an example
        try {
          const settingsRes = await fetch(
            "/api/phasmoTourney5/rounds/round1/settings"
          );
          if (settingsRes.ok) {
            const settings = await settingsRes.json();
            setRoundSettings(settings);
          }
        } catch {
          // Settings not available yet
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Container className="py-4">
        <h1 className="h4 fw-semibold mb-3">
          Phasmo Tourney 5 — What's Next?
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
          Phasmo Tourney 5 — What's Next?
        </h1>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const activePlayers = players.filter((p) => p.status === "Active");
  const immunePlayers = activePlayers.filter((p) => p.immune);
  const vulnerablePlayers = activePlayers.filter((p) => !p.immune);

  return (
    <Container className="py-4">
      <h1 className="h4 fw-semibold mb-3">Phasmo Tourney 5 — What's Next?</h1>

      <Stack gap={3}>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title as="h2" className="h5 mb-3">
              Current Tournament Status
            </Card.Title>
            <Stack gap={2}>
              <div>
                <strong>Active Players:</strong>{" "}
                <Badge bg="primary">{activePlayers.length}</Badge>
              </div>
              <div>
                <strong>Immune Players:</strong>{" "}
                <Badge bg="warning" text="dark">
                  {immunePlayers.length}
                </Badge>
              </div>
              <div>
                <strong>Vulnerable Players:</strong>{" "}
                <Badge bg="danger">{vulnerablePlayers.length}</Badge>
              </div>
            </Stack>
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title as="h2" className="h5 mb-3">
              Immune Players
            </Card.Title>
            {immunePlayers.length === 0 ? (
              <Alert variant="info" className="mb-0">
                No players are currently immune.
              </Alert>
            ) : (
              <div className="d-flex gap-2 flex-wrap">
                {immunePlayers.map((player) => (
                  <Badge
                    key={player.id}
                    bg="warning"
                    text="dark"
                    className="px-3 py-2"
                  >
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
              Upcoming Round
            </Card.Title>
            {roundSettings ? (
              <Stack gap={2}>
                {roundSettings.roundName && (
                  <div>
                    <strong>Round:</strong> {roundSettings.roundName}
                  </div>
                )}
                {roundSettings.startDate && (
                  <div>
                    <strong>Start Date:</strong> {roundSettings.startDate}
                  </div>
                )}
                {roundSettings.endDate && (
                  <div>
                    <strong>End Date:</strong> {roundSettings.endDate}
                  </div>
                )}
                {roundSettings.description && (
                  <div className="mt-2">
                    <strong>Description:</strong>
                    <p className="mt-1 mb-0">{roundSettings.description}</p>
                  </div>
                )}
              </Stack>
            ) : (
              <Alert variant="info" className="mb-0">
                Upcoming round details will be announced soon. Stay tuned!
              </Alert>
            )}
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title as="h2" className="h5 mb-3">
              What to Expect
            </Card.Title>
            <Alert variant="secondary" className="mb-0">
              <p className="mb-2">
                The next round will feature challenges, eliminations, and voting
                sessions. Watch for:
              </p>
              <ul className="mb-0">
                <li>Eliminator challenges where players face off</li>
                <li>Voting sessions to determine eliminations</li>
                <li>Immunity assignments for top performers</li>
                <li>Recorded runs with detailed scoring</li>
              </ul>
            </Alert>
          </Card.Body>
        </Card>
      </Stack>
    </Container>
  );
}
