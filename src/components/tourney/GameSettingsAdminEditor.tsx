"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Form, Button, Row, Col, Card, Tabs, Tab } from "react-bootstrap";
import type { GameSettings } from "../../types/gameSettings";
import { defaultGameSettings } from "../../types/gameSettings";
import { CURSED_POSSESSIONS } from "../../lib/utils/gameSettings";
import GameSettingsCard from "./GameSettingsCard";
import { useAuth } from "../../hooks/useAuth";

type Props = {
  roundId: string;
};

export default function GameSettingsAdminEditor({ roundId }: Props) {
  const { user, admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(defaultGameSettings);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/phasmoTourney5/rounds/${roundId}/settings`,
          { cache: "no-cache" }
        );
        if (res.ok) {
          const data = await res.json();
          if (mounted && data?.settings) {
            setSettings(data.settings as GameSettings);
            setNotes(data?.notes || "");
          }
        }
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [roundId]);

  const disabled = !admin || saving;

  function update<K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/admin/phasmoTourney5/rounds/${roundId}/settings`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settings,
            notes,
            updatedBy: user?.displayName || user?.uid || "admin",
          }),
        }
      );
      if (res.ok) setMessage("Saved settings.");
      else setMessage("Failed to save.");
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-3">
      <Card.Header>
        <strong>Admin: Round {roundId} Settings</strong>
      </Card.Header>
      <Card.Body>
        {!admin && (
          <div className="alert alert-warning">
            Admin access required to edit settings.
          </div>
        )}
        {loading ? (
          <div>Loading…</div>
        ) : (
          <Row>
            <Col md={6}>
              <Tabs
                defaultActiveKey="player"
                id="admin-game-settings-tabs"
                className="mb-3"
              >
                <Tab eventKey="player" title="Player">
                  <Form className="mt-3">
                    <Form.Group className="mb-2">
                      <Form.Label>Starting sanity</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.player.startingSanity}
                        min={0}
                        max={100}
                        disabled={disabled}
                        onChange={(e) =>
                          update("player", {
                            ...settings.player,
                            startingSanity: Number(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Sanity Pill restoration (%)</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.player.sanityPillRestorationPercent}
                        min={0}
                        max={100}
                        disabled={disabled}
                        onChange={(e) =>
                          update("player", {
                            ...settings.player,
                            sanityPillRestorationPercent: Number(
                              e.target.value
                            ),
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Sanity drain speed (%)</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.player.sanityDrainSpeedPercent}
                        min={0}
                        max={300}
                        disabled={disabled}
                        onChange={(e) =>
                          update("player", {
                            ...settings.player,
                            sanityDrainSpeedPercent: Number(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Sprinting</Form.Label>
                          <Form.Select
                            value={settings.player.sprinting}
                            disabled={disabled}
                            onChange={(e) =>
                              update("player", {
                                ...settings.player,
                                sprinting: e.target.value as any,
                              })
                            }
                          >
                            <option>On</option>
                            <option>Off</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Player speed (%)</Form.Label>
                          <Form.Control
                            type="number"
                            value={settings.player.playerSpeedPercent}
                            min={50}
                            max={200}
                            disabled={disabled}
                            onChange={(e) =>
                              update("player", {
                                ...settings.player,
                                playerSpeedPercent: Number(e.target.value),
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Flashlights</Form.Label>
                          <Form.Select
                            value={settings.player.flashlights}
                            disabled={disabled}
                            onChange={(e) =>
                              update("player", {
                                ...settings.player,
                                flashlights: e.target.value as any,
                              })
                            }
                          >
                            <option>On</option>
                            <option>Off</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Lose items and consumables</Form.Label>
                          <Form.Select
                            value={settings.player.loseItemsAndConsumables}
                            disabled={disabled}
                            onChange={(e) =>
                              update("player", {
                                ...settings.player,
                                loseItemsAndConsumables: e.target.value as any,
                              })
                            }
                          >
                            <option>On</option>
                            <option>Off</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Tab>
                <Tab eventKey="ghost" title="Ghost">
                  <Form className="mt-3">
                    <Form.Group className="mb-2">
                      <Form.Label>Ghost speed (%)</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.ghost.ghostSpeedPercent}
                        min={50}
                        max={200}
                        disabled={disabled}
                        onChange={(e) =>
                          update("ghost", {
                            ...settings.ghost,
                            ghostSpeedPercent: Number(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Roaming frequency</Form.Label>
                          <Form.Select
                            value={settings.ghost.roamingFrequency}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                roamingFrequency: e.target.value as any,
                              })
                            }
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Changing favourite room</Form.Label>
                          <Form.Select
                            value={settings.ghost.changingFavouriteRoom}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                changingFavouriteRoom: e.target.value as any,
                              })
                            }
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Activity level</Form.Label>
                          <Form.Select
                            value={settings.ghost.activityLevel}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                activityLevel: e.target.value as any,
                              })
                            }
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Event frequency</Form.Label>
                          <Form.Select
                            value={settings.ghost.eventFrequency}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                eventFrequency: e.target.value as any,
                              })
                            }
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Friendly ghost</Form.Label>
                          <Form.Select
                            value={settings.ghost.friendlyGhost}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                friendlyGhost: e.target.value as any,
                              })
                            }
                          >
                            <option>On</option>
                            <option>Off</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Grace period (s)</Form.Label>
                          <Form.Control
                            type="number"
                            value={settings.ghost.gracePeriodSeconds}
                            min={0}
                            max={5}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                gracePeriodSeconds: Number(e.target.value),
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Hunt duration</Form.Label>
                          <Form.Select
                            value={settings.ghost.huntDuration}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                huntDuration: e.target.value as any,
                              })
                            }
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Evidence given</Form.Label>
                          <Form.Select
                            value={String(settings.ghost.evidenceGiven)}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                evidenceGiven: Number(e.target.value) as
                                  | 0
                                  | 1
                                  | 2
                                  | 3,
                              })
                            }
                          >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Fingerprint chance (%)</Form.Label>
                          <Form.Control
                            type="number"
                            value={settings.ghost.fingerprintChancePercent}
                            min={0}
                            max={100}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                fingerprintChancePercent: Number(
                                  e.target.value
                                ),
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Fingerprint duration (s)</Form.Label>
                          <Form.Control
                            type="number"
                            value={settings.ghost.fingerprintDurationSeconds}
                            min={0}
                            max={120}
                            disabled={disabled}
                            onChange={(e) =>
                              update("ghost", {
                                ...settings.ghost,
                                fingerprintDurationSeconds: Number(
                                  e.target.value
                                ),
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Tab>
                <Tab eventKey="contract" title="Contract">
                  <Form className="mt-3">
                    <Form.Group className="mb-2">
                      <Form.Label>Setup time (s)</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.contract.setupTimeSeconds}
                        min={0}
                        max={120}
                        disabled={disabled}
                        onChange={(e) =>
                          update("contract", {
                            ...settings.contract,
                            setupTimeSeconds: Number(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Weather</Form.Label>
                          <Form.Select
                            value={settings.contract.weather}
                            disabled={disabled}
                            onChange={(e) =>
                              update("contract", {
                                ...settings.contract,
                                weather: e.target.value as any,
                              })
                            }
                          >
                            {(
                              [
                                "Clear",
                                "Sunny",
                                "Foggy",
                                "Windy",
                                "Rain",
                                "Snow",
                                "Thunderstorm",
                              ] as const
                            ).map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Doors starting open</Form.Label>
                          <Form.Select
                            value={settings.contract.doorsStartingOpen}
                            disabled={disabled}
                            onChange={(e) =>
                              update("contract", {
                                ...settings.contract,
                                doorsStartingOpen: e.target.value as any,
                              })
                            }
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Number of hiding places</Form.Label>
                          <Form.Select
                            value={settings.contract.numberOfHidingPlaces}
                            disabled={disabled}
                            onChange={(e) =>
                              update("contract", {
                                ...settings.contract,
                                numberOfHidingPlaces: e.target.value as any,
                              })
                            }
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Sanity monitor</Form.Label>
                          <Form.Select
                            value={settings.contract.sanityMonitor}
                            disabled={disabled}
                            onChange={(e) =>
                              update("contract", {
                                ...settings.contract,
                                sanityMonitor: e.target.value as any,
                              })
                            }
                          >
                            <option>On</option>
                            <option>Off</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Activity monitor</Form.Label>
                          <Form.Select
                            value={settings.contract.activityMonitor}
                            disabled={disabled}
                            onChange={(e) =>
                              update("contract", {
                                ...settings.contract,
                                activityMonitor: e.target.value as any,
                              })
                            }
                          >
                            <option>On</option>
                            <option>Off</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Fuse box at start of contract</Form.Label>
                          <Form.Select
                            value={settings.contract.fuseBoxAtStartOfContract}
                            disabled={disabled}
                            onChange={(e) =>
                              update("contract", {
                                ...settings.contract,
                                fuseBoxAtStartOfContract: e.target.value as any,
                              })
                            }
                          >
                            <option>On</option>
                            <option>Off</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Fuse box visible on map</Form.Label>
                          <Form.Select
                            value={settings.contract.fuseBoxVisibleOnMap}
                            disabled={disabled}
                            onChange={(e) =>
                              update("contract", {
                                ...settings.contract,
                                fuseBoxVisibleOnMap: e.target.value as any,
                              })
                            }
                          >
                            <option>On</option>
                            <option>Off</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-2">
                          <Form.Label>Cursed Possessions</Form.Label>
                          <Form.Select
                            value={String(settings.contract.cursedPossession)}
                            disabled={disabled}
                            onChange={(e) =>
                              update("contract", {
                                ...settings.contract,
                                cursedPossession: e.target.value as any,
                              })
                            }
                          >
                            <option value="Random">Random</option>
                            <option value="None">None</option>
                            {CURSED_POSSESSIONS.map((cp) => (
                              <option key={cp} value={cp}>
                                {cp}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Tab>
              </Tabs>
              <Form.Group className="mb-2">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={notes}
                  disabled={disabled}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  disabled={disabled}
                  onClick={() => setSettings(defaultGameSettings)}
                >
                  Apply Default
                </Button>
                <Button onClick={onSave} disabled={disabled}>
                  {saving ? "Saving…" : "Save Settings"}
                </Button>
              </div>
              {message && <div className="mt-2 text-muted">{message}</div>}
            </Col>
            <Col md={6}>
              <GameSettingsCard roundId={roundId} />
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}
