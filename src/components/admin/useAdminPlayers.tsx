"use client";
import { useEffect, useState } from "react";

interface Player {
  id: string;
  name: string;
  status: "Active" | "Inactive" | "Eliminated";
}

/**
 * useAdminPlayers - Custom hook for loading and managing player data
 *
 * Fetches players from the API and provides loading/error states.
 * Can optionally filter out eliminated players.
 *
 * @param filterEliminated - Whether to exclude eliminated players (default: true)
 * @returns Object containing players array, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { players, loading, error, refetch } = useAdminPlayers();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Alert variant="danger">{error}</Alert>;
 *
 * return <PlayerSelector players={players} ... />;
 * ```
 */
export default function useAdminPlayers(filterEliminated: boolean = true) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/phasmoTourney5/players");
      if (!res.ok) {
        throw new Error(`Failed to fetch players: ${res.status}`);
      }
      const json = await res.json();
      const playerList = Array.isArray(json) ? json : [];

      setPlayers(
        filterEliminated
          ? playerList.filter((p: Player) => p.status !== "Eliminated")
          : playerList
      );
    } catch (err: any) {
      setError(err?.message || "Failed to load players");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEliminated]);

  return {
    players,
    loading,
    error,
    refetch: fetchPlayers,
  };
}
