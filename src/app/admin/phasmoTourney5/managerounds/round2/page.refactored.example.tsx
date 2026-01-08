/**
 * EXAMPLE: Refactored Round 2 Admin Page
 * 
 * This is a demonstration of how the modular components can be used
 * to simplify admin pages. The original page is 240 lines, while this
 * refactored version is more maintainable and follows DRY principles.
 * 
 * Key improvements:
 * - AdminAuthGuard handles authentication check
 * - AdminPageLayout provides consistent page structure  
 * - useAdminPlayers handles player data fetching
 * - PlayerSelector provides consistent player selection UI
 * - FormCard wraps form with consistent styling
 * 
 * This pattern can be applied to all admin pages for consistency.
 */

"use client";
import { useMemo, useState, useEffect } from "react";
import { Button, Form, Row, Col, Table, Card } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import {
  AdminAuthGuard,
  AdminPageLayout,
  useAdminPlayers,
  PlayerSelector,
  FormCard,
} from "@/components/admin";
import GameSettingsAdminEditor from "../../../../../components/tourney/GameSettingsAdminEditor";
import {
  addRound2MoneyResult,
  listRound2MoneyResults,
} from "@/lib/services/phasmoTourney5";

interface Result {
  id: string;
  playerId: string;
  playerName: string;
  money: number;
  notes?: string;
  officer: string;
  createdAt: number;
}

export default function Round2ManageMoneyPageRefactored() {
  const { user } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  
  // Use custom hook for player data
  const { players } = useAdminPlayers();
  
  const [results, setResults] = useState<Result[]>([]);
  const [showRoundSettings, setShowRoundSettings] = useState(false);
  const [form, setForm] = useState({
    playerId: "",
    money: "",
    notes: "",
  });

  useEffect(() => {
    listRound2MoneyResults().then(setResults).catch(console.error);
  }, []);

  const sortedResults = useMemo(
    () => [...results].sort((a, b) => b.money - a.money),
    [results]
  );

  const resetForm = () => {
    setForm({ playerId: "", money: "", notes: "" });
  };

  const submitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const moneyNum = Number(form.money);
    if (!form.playerId || !isFinite(moneyNum)) return;
    
    const player = players.find((p) => p.id === form.playerId);
    try {
      await addRound2MoneyResult({
        officer,
        playerId: form.playerId,
        playerName: player?.name || form.playerId,
        money: moneyNum,
        notes: form.notes || undefined,
      });
      const list = await listRound2MoneyResults();
      setResults(list);
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to record result");
    }
  };

  return (
    <AdminAuthGuard>
      <AdminPageLayout
        title="Round 2 — Money Round"
        subtitle="Record and view money earned by players"
      >
        <FormCard
          title="Record Money Results"
          onSubmit={submitResult}
          submitLabel="Submit Result"
        >
          <Row className="g-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Officer</Form.Label>
                <Form.Control value={officer} disabled />
              </Form.Group>
              <PlayerSelector
                players={players}
                value={form.playerId}
                onChange={(id) => setForm({ ...form, playerId: id })}
                label="Player"
                required
              />
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Money earned</Form.Label>
                <Form.Control
                  type="number"
                  step="1"
                  min="0"
                  value={form.money}
                  onChange={(e) => setForm({ ...form, money: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </FormCard>

        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Card.Title as="h2" className="h5 fw-semibold">
              Results (descending)
            </Card.Title>
            <Table responsive size="sm" className="mt-2">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Money</th>
                  <th>Officer</th>
                  <th>Time</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.playerName}</td>
                    <td>${r.money.toLocaleString()}</td>
                    <td className="text-muted small">{r.officer}</td>
                    <td className="text-muted small">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="text-muted small">{r.notes || "-"}</td>
                  </tr>
                ))}
                {sortedResults.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-muted">
                      No results yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <section className="mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <h2 className="h5 mb-0">Round Settings</h2>
            <Button
              variant={showRoundSettings ? "outline-secondary" : "secondary"}
              onClick={() => setShowRoundSettings((v) => !v)}
            >
              {showRoundSettings ? "Hide" : "Show"}
            </Button>
          </div>
          {showRoundSettings && <GameSettingsAdminEditor roundId="round2" />}
        </section>
      </AdminPageLayout>
    </AdminAuthGuard>
  );
}
