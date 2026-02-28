"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-4 py-3">
          Admin access required.{" "}
          <Link href="/login" className="underline font-semibold">
            Log in
          </Link>
        </div>
      </div>
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
        },
      );
      if (!res.ok) throw new Error(`Failed to update player: ${res.status}`);
      const updated: Player = await res.json();
      setPlayers((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Manage Players</h1>
        <div className="flex items-center gap-2 mb-3">
          {/* Teams management is handled in Round 3 and Round 6 */}
          <Link
            href="/admin/phasmoTourney5/manageeliminator"
            className="rounded-lg border border-gray-400 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Manage Eliminator
          </Link>
        </div>
        <button
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            showAddForm
              ? "bg-gray-500 text-white hover:bg-gray-600"
              : "bg-blue-600 text-white hover:bg-blue-700",
          )}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add Player"}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
          <div className="p-4">
            <h2 className="text-base font-semibold">Add New Player</h2>
            <form onSubmit={handleSubmit} className="mt-3">
              {error && (
                <div className="mb-3 flex items-start justify-between rounded-xl border border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 px-4 py-3">
                  <span>{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-4 font-bold hover:opacity-70"
                  >
                    Ã—
                  </button>
                </div>
              )}
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Name *
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Twitch handle *
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.twitch}
                  onChange={(e) => setForm({ ...form, twitch: e.target.value })}
                  required
                  placeholder="e.g., DukeSenior"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Youtube handle
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.youtube}
                  onChange={(e) =>
                    setForm({ ...form, youtube: e.target.value })
                  }
                  placeholder="optional"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Discord handle *
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.discord}
                  onChange={(e) =>
                    setForm({ ...form, discord: e.target.value })
                  }
                  required
                  placeholder="e.g., User#1234 or @user"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Prestige *
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Timezone *
                </label>
                <input
                  type="text"
                  list="timezone-list"
                  placeholder="Start typing: e.g., America/New_York"
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-xs text-gray-500 mt-1">
                  Type to search; pick a suggested timezone.
                </p>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Link Auth UID (optional)
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.uid}
                  onChange={(e) => setForm({ ...form, uid: e.target.value })}
                  placeholder="Paste Firebase UID to link player"
                />
              </div>
              <div className="mb-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.auditionDone}
                    onChange={(e) =>
                      setForm({ ...form, auditionDone: e.target.checked })
                    }
                    className="rounded border-border"
                  />
                  <span>Audition done?</span>
                </label>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status *
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </select>
              </div>
              <div className="mb-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.immune}
                    onChange={(e) =>
                      setForm({ ...form, immune: e.target.checked })
                    }
                    className="rounded border-border"
                  />
                  <span>Immune?</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Add Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="p-4">
          <h2 className="text-base font-semibold">Players</h2>
          {loading ? (
            <div className="text-gray-500">Loadingâ€¦</div>
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left py-2 px-3 font-medium w-[3%]">
                      #
                    </th>
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Twitch</th>
                    <th className="text-left py-2 px-3 font-medium">Discord</th>
                    <th className="text-left py-2 px-3 font-medium">
                      Prestige
                    </th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                    <th className="text-left py-2 px-3 font-medium w-[5%]">
                      Immune
                    </th>
                    <th className="text-left py-2 px-3 font-medium">
                      Local Time
                    </th>
                    <th className="text-left py-2 px-3 font-medium w-[10%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-2 px-3 font-semibold">{idx + 1}</td>
                      <td className="py-2 px-3">{p.name}</td>
                      <td className="py-2 px-3">
                        <a
                          href={`https://twitch.tv/${p.twitch}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {p.twitch}
                        </a>
                      </td>
                      <td className="py-2 px-3">{p.discord}</td>
                      <td className="py-2 px-3">{p.prestige}</td>
                      <td className="py-2 px-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full text-xs font-medium px-2.5 py-0.5",
                            p.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : p.status === "Inactive"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                          )}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedPlayer(p);
                            setShowImmunModal(true);
                          }}
                          title={
                            p.immune
                              ? "Player is immune"
                              : "Click to toggle immune"
                          }
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                            p.immune
                              ? "bg-yellow-500 text-white hover:bg-yellow-600"
                              : "border border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                          )}
                        >
                          {p.immune ? "ðŸ›¡ï¸" : "â€”"}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
                        {liveTime[p.id] || "â€”"}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => {
                            setSelectedPlayer(p);
                            setShowEditModal(true);
                          }}
                          className="rounded-lg border border-blue-600 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          className="ml-2 rounded-lg border border-red-600 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={async () => {
                            const confirmed = window.confirm(
                              `Delete player "${p.name}"? This can be undone only by re-adding.`,
                            );
                            if (!confirmed) return;
                            try {
                              const res = await fetch(
                                `/api/admin/phasmoTourney5/players/${p.id}`,
                                { method: "DELETE" },
                              );
                              if (!res.ok)
                                throw new Error(
                                  `Failed to delete player: ${res.status}`,
                                );
                              setPlayers((prev) =>
                                prev.filter((x) => x.id !== p.id),
                              );
                            } catch (e: any) {
                              setError(e?.message || "Failed to delete player");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {players.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-2 px-3 text-gray-500">
                        No players yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Player Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card dark:bg-card-dark border border-border dark:border-border-dark shadow-xl mx-4">
            <div className="flex items-center justify-between border-b border-border dark:border-border-dark p-4">
              <h3 className="text-lg font-semibold">
                Edit Player: {selectedPlayer?.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                Ã—
              </button>
            </div>
            <div className="p-4">
              {selectedPlayer && (
                <div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Name
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedPlayer.name}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Twitch
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedPlayer.twitch}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          twitch: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Youtube
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedPlayer.youtube || ""}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          youtube: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Discord
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedPlayer.discord}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          discord: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Prestige
                    </label>
                    <select
                      className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Timezone
                    </label>
                    <input
                      type="text"
                      list="timezone-list-edit"
                      className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Status
                    </label>
                    <select
                      className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedPlayer.auditionDone}
                        onChange={(e) =>
                          setSelectedPlayer({
                            ...selectedPlayer,
                            auditionDone: e.target.checked,
                          })
                        }
                        className="rounded border-border"
                      />
                      <span>Audition done?</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-border dark:border-border-dark p-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Immune Toggle Confirmation Modal */}
      {showImmunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowImmunModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-card dark:bg-card-dark border border-border dark:border-border-dark shadow-xl mx-4">
            <div className="flex items-center justify-between border-b border-border dark:border-border-dark p-4">
              <h3 className="text-lg font-semibold">Confirm Immune Status</h3>
              <button
                onClick={() => setShowImmunModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                Ã—
              </button>
            </div>
            <div className="p-4">
              <p>
                Are you sure you want to{" "}
                <strong>
                  {selectedPlayer?.immune ? "remove" : "grant"} immunity
                </strong>{" "}
                for <strong>{selectedPlayer?.name}</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border dark:border-border-dark p-4">
              <button
                onClick={() => setShowImmunModal(false)}
                className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleImmune}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
                  selectedPlayer?.immune
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-600 hover:bg-green-700",
                )}
              >
                {selectedPlayer?.immune ? "Remove Immunity" : "Grant Immunity"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teams management removed; handled per-round */}
    </div>
  );
}
