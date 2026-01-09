"use client";
import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";
import type { GameSettings } from "../../types/gameSettings";
import { defaultGameSettings } from "../../types/gameSettings";

type Props = {
  roundId: string;
  hideScoring?: boolean;
};

export default function GameSettingsCard({ roundId, hideScoring }: Props) {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/phasmoTourney5/rounds/${roundId}/settings`,
          { cache: "no-cache" }
        );
        if (res.ok) {
          const data = (await res.json()) as GameSettings;
          if (mounted) setSettings(data);
        } else {
          if (mounted) setSettings(defaultGameSettings);
        }
      } catch {
        if (mounted) setSettings(defaultGameSettings);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [roundId]);

  const s = settings ?? defaultGameSettings;
  const scoreAssigned = Boolean(s.meta?.scoreSystemAssigned);

  return (
    <Card className="mb-3">
      <Card.Header>
        <strong>Round Settings</strong>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex align-items-center gap-2">
            <Spinner size="sm" /> Loading…
          </div>
        ) : (
          <>
            <div className="mb-3">
              <strong>Map:</strong> {s.contract.mapName || "Not set"}
            </div>
            {scoreAssigned && !hideScoring && (
              <div className="mb-3">
                <strong>Scoring:</strong>
                <ul className="mb-2">
                  <li>Completed Objectives (Max 3): +2 each → +6 max</li>
                  <li>Ghost Picture: +5</li>
                  <li>Bone Picture: +3</li>
                  <li>Player Survival: +3</li>
                  <li>Correct Ghost: +3</li>
                  <li>Perfect Game: +5</li>
                </ul>
                <em>Max total: 25</em>
              </div>
            )}
            <Tabs
              defaultActiveKey="player"
              id="game-settings-tabs"
              className="mb-3"
            >
              <Tab eventKey="player" title="Player">
                <ul className="mb-3">
                  <li>Starting sanity: {s.player.startingSanity}</li>
                  <li>
                    Sanity Pill restoration (%):{" "}
                    {s.player.sanityPillRestorationPercent}
                  </li>
                  <li>
                    Sanity drain speed (%): {s.player.sanityDrainSpeedPercent}
                  </li>
                  <li>Sprinting: {s.player.sprinting}</li>
                  <li>Player speed (%): {s.player.playerSpeedPercent}</li>
                  <li>Flashlights: {s.player.flashlights}</li>
                  <li>
                    Lose items and consumables:{" "}
                    {s.player.loseItemsAndConsumables}
                  </li>
                </ul>
              </Tab>
              <Tab eventKey="ghost" title="Ghost">
                <ul className="mb-3">
                  <li>Ghost speed (%): {s.ghost.ghostSpeedPercent}</li>
                  <li>Roaming frequency: {s.ghost.roamingFrequency}</li>
                  <li>
                    Changing favourite room: {s.ghost.changingFavouriteRoom}
                  </li>
                  <li>Activity level: {s.ghost.activityLevel}</li>
                  <li>Event frequency: {s.ghost.eventFrequency}</li>
                  <li>Friendly ghost: {s.ghost.friendlyGhost}</li>
                  <li>Grace period (s): {s.ghost.gracePeriodSeconds}</li>
                  <li>Hunt duration: {s.ghost.huntDuration}</li>
                  <li>Evidence given: {s.ghost.evidenceGiven}</li>
                  <li>
                    Fingerprint chance (%): {s.ghost.fingerprintChancePercent}
                  </li>
                  <li>
                    Fingerprint duration (s):{" "}
                    {s.ghost.fingerprintDurationSeconds}
                  </li>
                </ul>
              </Tab>
              <Tab eventKey="contract" title="Contract">
                <ul className="mb-3">
                  {s.contract.mapName && <li>Map: {s.contract.mapName}</li>}
                  <li>Setup time (s): {s.contract.setupTimeSeconds}</li>
                  <li>Weather: {s.contract.weather}</li>
                  <li>Doors starting open: {s.contract.doorsStartingOpen}</li>
                  <li>
                    Number of hiding places: {s.contract.numberOfHidingPlaces}
                  </li>
                  <li>Sanity monitor: {s.contract.sanityMonitor}</li>
                  <li>Activity monitor: {s.contract.activityMonitor}</li>
                  <li>
                    Fuse box at start of contract:{" "}
                    {s.contract.fuseBoxAtStartOfContract}
                  </li>
                  <li>
                    Fuse box visible on map: {s.contract.fuseBoxVisibleOnMap}
                  </li>
                  <li>Cursed Possessions: {s.contract.cursedPossession}</li>
                </ul>
              </Tab>
            </Tabs>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
