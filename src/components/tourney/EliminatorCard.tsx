"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  addEliminatorSession,
  listEliminatorSessions,
  deleteEliminatorSession,
} from "@/lib/services/phasmoTourney5";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}

export default function EliminatorCard({
  playerCountOptions = [2, 3, 5],
}: {
  playerCountOptions?: number[];
}) {
  const { user, admin } = useAuth();
  const officer = user?.displayName || user?.email || "Unknown";
  const [players, setPlayers] = useState<Player[]>([]);
  const [challenger, setChallenger] = useState<string>("");
  const [defender, setDefender] = useState<string>("");
  const [winner, setWinner] = useState<string>("");
  const [playerCount, setPlayerCount] = useState<number>(
    playerCountOptions[0] || 2
  );
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      challengerId: string;
      defenderId: string;
      winnerId: string;
      officer: string;
      createdAt: number;
      playerCount?: number | null;
    }>
  >([]);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    sessionId: string | null;
  }>({ show: false, sessionId: null });
  const [viewModal, setViewModal] = useState<{
    show: boolean;
    session: (typeof sessions)[0] | null;
  }>({ show: false, session: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/phasmoTourney5/players");
        const json = await res.json();
        setPlayers(
          Array.isArray(json)
            ? json.filter((p: any) => p.status !== "Eliminated")
            : []
        );
      } catch {}
      try {
        const list = await listEliminatorSessions();
        setSessions(list);
      } catch {}
    })();
  }, []);

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const winnerOptions = useMemo(() => {
    if (playerCount === 2) return [challenger, defender].filter(Boolean);
    return selectedPlayers.filter(Boolean);
  }, [playerCount, challenger, defender, selectedPlayers]);

  async function submitEliminator(e: React.FormEvent) {
    e.preventDefault();
    if (playerCount === 2) {
      if (!challenger || !defender || !winner) return;
      await addEliminatorSession({
        officer,
        challengerId: challenger,
        defenderId: defender,
        winnerId: winner,
        playerCount,
      });
    } else {
      if (selectedPlayers.length !== playerCount || !winner) return;
      await addEliminatorSession({
        officer,
        challengerId: selectedPlayers[0],
        defenderId: selectedPlayers[1],
        winnerId: winner,
        playerCount,
      });
    }
    const list = await listEliminatorSessions();
    setSessions(list);
    setChallenger("");
    setDefender("");
    setWinner("");
    setSelectedPlayers([]);
  }

  function playerName(id: string) {
    return players.find((p) => p.id === id)?.name || id;
  }

  async function handleDelete() {
    if (!deleteModal.sessionId) return;
    setDeleting(true);
    try {
      await deleteEliminatorSession(deleteModal.sessionId);
      const list = await listEliminatorSessions();
      setSessions(list);
      setDeleteModal({ show: false, sessionId: null });
    } catch (error: any) {
      alert(error?.message || "Failed to delete session");
    } finally {
      setDeleting(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50";
  const selectClasses = cn(inputClasses, "appearance-auto");

  return (
    <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-0">Eliminator</h2>
        <form onSubmit={submitEliminator} className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-foreground">
                Officer
              </label>
              <input
                type="text"
                className={cn(inputClasses, "disabled:opacity-50")}
                value={officer}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-foreground">
                Number of players
              </label>
              <select
                className={selectClasses}
                value={String(playerCount)}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
              >
                {playerCountOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            {playerCount === 2 ? (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Defender
                  </label>
                  <select
                    className={selectClasses}
                    value={defender}
                    onChange={(e) => setDefender(e.target.value)}
                    required
                  >
                    <option value="">Select player...</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Challenger
                  </label>
                  <select
                    className={selectClasses}
                    value={challenger}
                    onChange={(e) => setChallenger(e.target.value)}
                    required
                  >
                    <option value="">Select player...</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="md:col-span-2 mb-3">
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Players
                </label>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: playerCount }).map((_, idx) => (
                    <select
                      key={idx}
                      className={cn(selectClasses, "flex-1")}
                      value={selectedPlayers[idx] || ""}
                      onChange={(e) => {
                        const next = [...selectedPlayers];
                        next[idx] = e.target.value;
                        setSelectedPlayers(next);
                      }}
                    >
                      <option value="">Player {idx + 1}</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            )}
            <div className="md:col-span-3 mb-3">
              <label className="block text-sm font-medium mb-1 text-foreground">
                Winner (manual)
              </label>
              <select
                className={selectClasses}
                value={winner}
                onChange={(e) => setWinner(e.target.value)}
                required
              >
                <option value="">Select winner...</option>
                {winnerOptions.map((pid) => (
                  <option key={pid} value={pid}>
                    {playerName(pid)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              className="text-sm px-4 py-2 rounded-lg border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-colors"
              onClick={() => {
                setChallenger("");
                setDefender("");
                setWinner("");
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="overflow-x-auto mt-3">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Challenger</th>
                <th className="text-left py-2 px-2">Defender</th>
                <th className="text-left py-2 px-2">Winner</th>
                <th className="text-left py-2 px-2">Officer</th>
                <th className="text-left py-2 px-2">Time</th>
                <th className="text-left py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-border dark:border-border-dark"
                >
                  <td className="py-2 px-2">{i + 1}</td>
                  <td className="py-2 px-2">{playerName(s.challengerId)}</td>
                  <td className="py-2 px-2">{playerName(s.defenderId)}</td>
                  <td className="py-2 px-2">{playerName(s.winnerId)}</td>
                  <td className="py-2 px-2 text-foreground-secondary text-xs">
                    {s.officer}
                  </td>
                  <td className="py-2 px-2 text-foreground-secondary text-xs">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      className="text-sm px-3 py-1.5 rounded-lg border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-colors"
                      onClick={() =>
                        setViewModal({ show: true, session: s })
                      }
                    >
                      View
                    </button>
                    {admin && (
                      <button
                        type="button"
                        className="text-sm px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors ml-2"
                        onClick={() =>
                          setDeleteModal({ show: true, sessionId: s.id })
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-2 px-2 text-foreground-secondary">
                    No eliminator sessions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDeleteModal({ show: false, sessionId: null })}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
              <button
                type="button"
                className="text-foreground-secondary hover:text-foreground"
                onClick={() =>
                  setDeleteModal({ show: false, sessionId: null })
                }
              >
                &#x2715;
              </button>
            </div>
            <div className="p-4">
              Are you sure you want to delete this eliminator session? This
              action cannot be undone.
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border dark:border-border-dark">
              <button
                type="button"
                className="bg-gray-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                onClick={() =>
                  setDeleteModal({ show: false, sessionId: null })
                }
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModal.show && viewModal.session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setViewModal({ show: false, session: null })}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
              <h3 className="text-lg font-semibold">
                Eliminator Session Details
              </h3>
              <button
                type="button"
                className="text-foreground-secondary hover:text-foreground"
                onClick={() => setViewModal({ show: false, session: null })}
              >
                &#x2715;
              </button>
            </div>
            <div className="p-4">
              <table className="w-full border-collapse text-sm border border-border dark:border-border-dark">
                <tbody>
                  <tr className="border-b border-border dark:border-border-dark">
                    <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                      Challenger
                    </td>
                    <td className="py-1.5 px-2">
                      {playerName(viewModal.session.challengerId)}
                    </td>
                  </tr>
                  <tr className="border-b border-border dark:border-border-dark">
                    <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                      Defender
                    </td>
                    <td className="py-1.5 px-2">
                      {playerName(viewModal.session.defenderId)}
                    </td>
                  </tr>
                  <tr className="border-b border-border dark:border-border-dark">
                    <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                      Winner
                    </td>
                    <td className="py-1.5 px-2">
                      <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-500 text-white">
                        {playerName(viewModal.session.winnerId)}
                      </span>
                    </td>
                  </tr>
                  {viewModal.session.playerCount && (
                    <tr className="border-b border-border dark:border-border-dark">
                      <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                        Player Count
                      </td>
                      <td className="py-1.5 px-2">
                        {viewModal.session.playerCount}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-border dark:border-border-dark">
                    <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                      Officer
                    </td>
                    <td className="py-1.5 px-2">
                      {viewModal.session.officer}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1.5 px-2 border-r border-border dark:border-border-dark">
                      Date
                    </td>
                    <td className="py-1.5 px-2">
                      {new Date(
                        viewModal.session.createdAt
                      ).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end px-4 py-3 border-t border-border dark:border-border-dark">
              <button
                type="button"
                className="bg-gray-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => setViewModal({ show: false, session: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}