"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { GameSettings } from "../../types/gameSettings";
import { defaultGameSettings } from "../../types/gameSettings";

type Props = {
  roundId: string;
  hideScoring?: boolean;
};

const tabKeys = ["player", "ghost", "contract"] as const;
type TabKey = (typeof tabKeys)[number];

export default function GameSettingsCard({ roundId, hideScoring }: Props) {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("player");

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
    <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-3">
      <div className="px-4 py-3 border-b border-border dark:border-border-dark">
        <strong>Round Settings</strong>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading
          </div>
        ) : (
          <>
            <div className="mb-3">
              <strong>Map:</strong> {s.contract.mapName || "Not set"}
            </div>
            {scoreAssigned && !hideScoring && (
              <div className="mb-3">
                <strong>Scoring:</strong>
                <ul className="mb-2 list-disc pl-5">
                  <li>Completed Objectives (Max 3): +2 each  +6 max</li>
                  <li>Ghost Picture: +5</li>
                  <li>Bone Picture: +3</li>
                  <li>Player Survival: +3</li>
                  <li>Correct Ghost: +3</li>
                  <li>Perfect Game: +5</li>
                </ul>
                <em>Max total: 25</em>
              </div>
            )}
            {/* Tabs */}
            <div className="mb-3">
              <div className="flex border-b border-border dark:border-border-dark">
                {tabKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "px-4 py-2 text-sm font-medium capitalize transition-colors -mb-px",
                      activeTab === key
                        ? "border-b-2 border-primary-500 text-primary-500"
                        : "text-foreground-secondary hover:text-foreground"
                    )}
                    onClick={() => setActiveTab(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {activeTab === "player" && (
                <ul className="mb-3 mt-3 list-disc pl-5 space-y-1">
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
              )}

              {activeTab === "ghost" && (
                <ul className="mb-3 mt-3 list-disc pl-5 space-y-1">
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
              )}

              {activeTab === "contract" && (
                <ul className="mb-3 mt-3 list-disc pl-5 space-y-1">
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
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}