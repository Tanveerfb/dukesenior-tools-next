"use client";
import { useEffect, useState } from "react";
import { Card, Button, Row, Col, Spinner, Alert, Modal } from "react-bootstrap";
import type { WildcardOption } from "@/lib/services/phasmoTourney5";
import {
  ROUND1_DEFAULT_WILDCARDS,
  drawWildcardChoices,
} from "@/lib/services/phasmoTourney5";

// Temporary client-only mock until server persistence is added
export function WildcardChoices({ player }: { player: string }) {
  const [choices, setChoices] = useState<WildcardOption[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // simulate fetch existing trio; for now always redraw once
    if (!choices) {
      const trio = drawWildcardChoices(ROUND1_DEFAULT_WILDCARDS);
      setChoices(trio);
    }
  }, [choices]);

  function initiatePick(id: string) {
    if (selected || loading) return;
    setPending(id);
    setConfirming(true);
  }

  async function confirmPick() {
    if (!pending) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/t5/round1/select-wildcard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player, wildcardId: pending }),
      });
      if (res.ok) {
        setSelected(pending);
      } else {
        const j = await res.json().catch(() => ({ error: "Failed" }));
        setError(j.error || "Failed to save wildcard");
      }
    } finally {
      setLoading(false);
      setConfirming(false);
      setPending(null);
    }
  }

  if (!choices) return <Spinner animation="border" size="sm" />;

  return (
    <div>
      <h5 className="fw-semibold mb-2">Wildcard Selection</h5>
      {selected && (
        <Alert variant="success" className="py-2 small">
          Locked in:{" "}
          <strong>{choices.find((c) => c.id === selected)?.label}</strong>
        </Alert>
      )}
      <Row xs={1} sm={3} className="g-2">
        {choices.map((c) => {
          const locked = !!selected && selected !== c.id;
          return (
            <Col key={c.id}>
              <Card
                className={
                  "h-100 shadow-sm " +
                  (selected === c.id ? "border-success" : "")
                }
              >
                <Card.Body className="d-flex flex-column">
                  <div className="fw-semibold small mb-1">{c.label}</div>
                  <div className="text-muted small flex-grow-1">
                    {c.description || "—"}
                  </div>
                  <Button
                    size="sm"
                    className="mt-2"
                    variant={selected === c.id ? "success" : "primary"}
                    disabled={!!selected || loading}
                    onClick={() => initiatePick(c.id)}
                  >
                    {selected === c.id
                      ? "Selected"
                      : locked
                      ? "Unavailable"
                      : "Select"}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      {!selected && (
        <div className="small text-muted mt-2">
          You must lock in one wildcard before performing your run.
        </div>
      )}
      {error && (
        <Alert
          variant="danger"
          className="small mt-2"
          dismissible
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      <Modal
        show={confirming}
        onHide={() => !loading && setConfirming(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Wildcard</Modal.Title>
        </Modal.Header>
        <Modal.Body className="small">
          {pending && (
            <p>
              Lock in wildcard:{" "}
              <strong>{choices.find((c) => c.id === pending)?.label}</strong>?
              This cannot be changed.
            </p>
          )}
          {loading && <Spinner size="sm" animation="border" />}
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={loading}
            onClick={confirmPick}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
