"use client";
import { Form } from "react-bootstrap";

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
 * 
 * @example
 * ```tsx
 * <PlayerSelector
 *   players={players}
 *   value={form.playerId}
 *   onChange={(id) => setForm({ ...form, playerId: id })}
 *   label="Select Player"
 *   required
 * />
 * ```
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
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
            {showStatus && player.status ? ` (${player.status})` : ""}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}
