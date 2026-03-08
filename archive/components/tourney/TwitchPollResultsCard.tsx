"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCmsUploads } from "@/hooks/useCmsUploads";
import {
  addRound4TwitchPollRecord,
  listRound4TwitchPollRecords,
} from "@/lib/services/phasmoTourney5";

interface PollRecord {
  id: string;
  playerId: string;
  opponentId: string;
  matchNumber: number;
  pollSummary: string;
  imageUrl?: string;
  officer: string;
  createdAt: number;
}

export default function TwitchPollResultsCard() {
  const { user } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const { uploadImages } = useCmsUploads();
  const [players, setPlayers] = useState<Array<{ id: string; name: string }>>(
    []
  );

  const [form, setForm] = useState<{
    matchNumber: string;
    playerId: string;
    opponentId: string;
    pollSummary: string;
    imageFile?: File | null;
  }>({
    matchNumber: "",
    playerId: "",
    opponentId: "",
    pollSummary: "",
    imageFile: null,
  });
  const [records, setRecords] = useState<PollRecord[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await listRound4TwitchPollRecords();
        setRecords(
          list.map((r) => ({
            id: r.id,
            officer: r.officer,
            matchNumber: r.matchNumber,
            playerId: r.playerId,
            opponentId: r.opponentId,
            pollSummary: r.pollSummary,
            imageUrl: r.imageUrl,
            createdAt: r.createdAt,
          }))
        );
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/phasmoTourney5/players");
        const json = await res.json();
        const list = Array.isArray(json)
          ? json
              .filter((p: any) => p.status !== "Eliminated")
              .map((p: any) => ({ id: p.id, name: p.name }))
          : [];
        setPlayers(list);
      } catch {}
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const matchNumber = Number(form.matchNumber);
    if (!isFinite(matchNumber) || !form.playerId || !form.opponentId) return;
    let imageUrl: string | undefined = undefined;
    if (form.imageFile) {
      await uploadImages([form.imageFile], (url) => {
        imageUrl = url;
      });
    }
    const _id = await addRound4TwitchPollRecord({
      officer,
      matchNumber,
      playerId: form.playerId,
      opponentId: form.opponentId,
      pollSummary: form.pollSummary,
      imageUrl,
    });
    const list = await listRound4TwitchPollRecords();
    setRecords(
      list.map((r) => ({
        id: r.id,
        officer: r.officer,
        matchNumber: r.matchNumber,
        playerId: r.playerId,
        opponentId: r.opponentId,
        pollSummary: r.pollSummary,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt,
      }))
    );
    setForm({
      matchNumber: "",
      playerId: "",
      opponentId: "",
      pollSummary: "",
      imageFile: null,
    });
  }

  const inputClasses =
    "w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500";
  const selectClasses = inputClasses + " appearance-auto";

  return (
    <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-0">Twitch Poll Results</h2>
        <form onSubmit={submit} className="mt-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Match #
              </label>
              <input
                type="number"
                className={inputClasses}
                value={form.matchNumber}
                onChange={(e) =>
                  setForm({ ...form, matchNumber: e.target.value })
                }
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Player
              </label>
              <select
                className={selectClasses}
                value={form.playerId}
                onChange={(e) => setForm({ ...form, playerId: e.target.value })}
              >
                <option value="">Select player...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Opponent
              </label>
              <select
                className={selectClasses}
                value={form.opponentId}
                onChange={(e) =>
                  setForm({ ...form, opponentId: e.target.value })
                }
              >
                <option value="">Select opponent...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-foreground">
                Poll Summary
              </label>
              <textarea
                rows={2}
                className={inputClasses}
                value={form.pollSummary}
                onChange={(e) =>
                  setForm({ ...form, pollSummary: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                className={inputClasses}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, imageFile: file || null });
                }}
              />
            </div>
            <button
              type="submit"
              className="bg-primary-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Save
            </button>
          </div>
        </form>

        <div className="overflow-x-auto mt-3">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Match</th>
                <th className="text-left py-2 px-2">Player</th>
                <th className="text-left py-2 px-2">Opponent</th>
                <th className="text-left py-2 px-2">Officer</th>
                <th className="text-left py-2 px-2">Time</th>
                <th className="text-left py-2 px-2">Poll</th>
                <th className="text-left py-2 px-2">Image</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-border dark:border-border-dark"
                >
                  <td className="py-2 px-2">{i + 1}</td>
                  <td className="py-2 px-2">{r.matchNumber}</td>
                  <td className="py-2 px-2">{r.playerId}</td>
                  <td className="py-2 px-2">{r.opponentId}</td>
                  <td className="py-2 px-2 text-foreground-secondary text-xs">
                    {r.officer}
                  </td>
                  <td className="py-2 px-2 text-foreground-secondary text-xs">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-foreground-secondary text-xs">
                    {r.pollSummary}
                  </td>
                  <td className="py-2 px-2">
                    {r.imageUrl ? (
                      <a
                        href={r.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-500 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "\u2014"
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-2 px-2 text-foreground-secondary">
                    No poll records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}