"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { GameSettings } from "../../types/gameSettings";
import { defaultGameSettings } from "../../types/gameSettings";
import { CURSED_POSSESSIONS } from "../../lib/utils/gameSettings";
import GameSettingsCard from "./GameSettingsCard";
import { useAuth } from "../../hooks/useAuth";

type Props = {
  roundId: string;
};

const adminTabKeys = ["player", "ghost", "contract"] as const;
type AdminTabKey = (typeof adminTabKeys)[number];

export default function GameSettingsAdminEditor({ roundId }: Props) {
  const { user, admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(defaultGameSettings);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTabKey>("player");

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

  const inputClasses =
    "w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50";
  const selectClasses = cn(inputClasses, "appearance-auto");

  return (
    <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-3">
      <div className="px-4 py-3 border-b border-border dark:border-border-dark">
        <strong>Admin: Round {roundId} Settings</strong>
      </div>
      <div className="p-4">
        {!admin && (
          <div className="rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 mb-3 text-sm">
            Admin access required to edit settings.
          </div>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Map
                </label>
                <select
                  className={selectClasses}
                  value={settings.contract.mapName || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    update("contract", {
                      ...settings.contract,
                      mapName: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">Select map...</option>
                  {[
                    "6 Tanglewood Drive",
                    "42 Edgefield Road",
                    "10 Ridgeview Court",
                    "Nell's Diner",
                    "13 Willow Street",
                    "Point Hope",
                    "Grafton Farmhouse",
                    "Bleasdale Farmhouse",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    role="switch"
                    className="h-4 w-4 rounded accent-primary-500"
                    disabled={disabled}
                    checked={Boolean(settings.meta?.scoreSystemAssigned)}
                    onChange={() =>
                      update("meta", {
                        ...(settings.meta || {}),
                        scoreSystemAssigned: !Boolean(
                          settings.meta?.scoreSystemAssigned
                        ),
                      })
                    }
                  />
                  Assign score system to this round
                </label>
              </div>

              {/* Tabs */}
              <div className="mb-3">
                <div className="flex border-b border-border dark:border-border-dark">
                  {adminTabKeys.map((key) => (
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
              </div>

              {/* Player Tab */}
              {activeTab === "player" && (
                <form className="mt-3 space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Starting sanity</label>
                    <input
                      type="number"
                      className={inputClasses}
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Sanity Pill restoration (%)</label>
                    <input
                      type="number"
                      className={inputClasses}
                      value={settings.player.sanityPillRestorationPercent}
                      min={0}
                      max={100}
                      disabled={disabled}
                      onChange={(e) =>
                        update("player", {
                          ...settings.player,
                          sanityPillRestorationPercent: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Sanity drain speed (%)</label>
                    <input
                      type="number"
                      className={inputClasses}
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
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Sprinting</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Player speed (%)</label>
                      <input
                        type="number"
                        className={inputClasses}
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
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Flashlights</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Lose items and consumables</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                  </div>
                </form>
              )}

              {/* Ghost Tab */}
              {activeTab === "ghost" && (
                <form className="mt-3 space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Ghost speed (%)</label>
                    <input
                      type="number"
                      className={inputClasses}
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
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Roaming frequency</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Changing favourite room</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Activity level</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Event frequency</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Friendly ghost</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Grace period (s)</label>
                      <input
                        type="number"
                        className={inputClasses}
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
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Hunt duration</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Evidence given</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Fingerprint chance (%)</label>
                      <input
                        type="number"
                        className={inputClasses}
                        value={settings.ghost.fingerprintChancePercent}
                        min={0}
                        max={100}
                        disabled={disabled}
                        onChange={(e) =>
                          update("ghost", {
                            ...settings.ghost,
                            fingerprintChancePercent: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Fingerprint duration (s)</label>
                      <input
                        type="number"
                        className={inputClasses}
                        value={settings.ghost.fingerprintDurationSeconds}
                        min={0}
                        max={120}
                        disabled={disabled}
                        onChange={(e) =>
                          update("ghost", {
                            ...settings.ghost,
                            fingerprintDurationSeconds: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* Contract Tab */}
              {activeTab === "contract" && (
                <form className="mt-3 space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Setup time (s)</label>
                    <input
                      type="number"
                      className={inputClasses}
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
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Weather</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Doors starting open</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Number of hiding places</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Sanity monitor</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Activity monitor</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Fuse box at start of contract</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Fuse box visible on map</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Cursed Possessions</label>
                      <select
                        className={selectClasses}
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
                      </select>
                    </div>
                  </div>
                </form>
              )}

              <div className="mt-3">
                <label className="block text-sm font-medium mb-1 text-foreground">Notes</label>
                <textarea
                  rows={2}
                  className={inputClasses}
                  value={notes}
                  disabled={disabled}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="bg-gray-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => setSettings(defaultGameSettings)}
                >
                  Apply Default
                </button>
                <button
                  type="button"
                  className="bg-primary-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  onClick={onSave}
                  disabled={disabled}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
              {message && <div className="mt-2 text-foreground-secondary text-sm">{message}</div>}
            </div>
            <div>
              <GameSettingsCard roundId={roundId} hideScoring />
              {Boolean(settings.meta?.scoreSystemAssigned) && (
                <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mt-3">
                  <div className="px-4 py-3 border-b border-border dark:border-border-dark">
                    <strong>Scoring System</strong>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-border dark:border-border-dark">
                            <th className="text-left py-2 px-2">Criterion</th>
                            <th className="text-left py-2 px-2">Points</th>
                            <th className="text-left py-2 px-2">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border dark:border-border-dark">
                            <td className="py-2 px-2">Completed Objectives</td>
                            <td className="py-2 px-2">+2 each</td>
                            <td className="py-2 px-2">Max 3 &rarr; +6</td>
                          </tr>
                          <tr className="border-b border-border dark:border-border-dark">
                            <td className="py-2 px-2">Ghost Picture</td>
                            <td className="py-2 px-2">+5</td>
                            <td className="py-2 px-2"></td>
                          </tr>
                          <tr className="border-b border-border dark:border-border-dark">
                            <td className="py-2 px-2">Bone Picture</td>
                            <td className="py-2 px-2">+3</td>
                            <td className="py-2 px-2"></td>
                          </tr>
                          <tr className="border-b border-border dark:border-border-dark">
                            <td className="py-2 px-2">Player Survival</td>
                            <td className="py-2 px-2">+3</td>
                            <td className="py-2 px-2"></td>
                          </tr>
                          <tr className="border-b border-border dark:border-border-dark">
                            <td className="py-2 px-2">Correct Ghost</td>
                            <td className="py-2 px-2">+3</td>
                            <td className="py-2 px-2"></td>
                          </tr>
                          <tr className="border-b border-border dark:border-border-dark">
                            <td className="py-2 px-2">Perfect Game</td>
                            <td className="py-2 px-2">+5</td>
                            <td className="py-2 px-2"></td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="py-2 px-2 text-foreground-secondary">
                              Max total: 25
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}