"use client";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  status?: string;
}

interface PlayerSelectorProps {
  players: Player[];
  value: string;
  onChange: (playerId: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showStatus?: boolean;
}

/**
 * PlayerSelector - Reusable dropdown for selecting players
 *
 * A consistent player selection component used across admin forms.
 * Optionally displays player status and can filter based on various criteria.
 */
export default function PlayerSelector({
  players,
  value,
  onChange,
  label = "Player",
  placeholder = "Choose a player...",
  required = false,
  disabled = false,
  showStatus = false,
}: PlayerSelectorProps) {
  return (
    <div className="mt-3 w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors",
          "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
          "dark:border-border-dark dark:bg-background-dark",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <option value="">{placeholder}</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
            {showStatus && player.status ? ` (${player.status})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
