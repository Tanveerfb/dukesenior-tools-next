"use client";
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

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
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth margin="normal" required={required} disabled={disabled}>
      <InputLabel id="player-selector-label">{label}</InputLabel>
      <Select
        labelId="player-selector-label"
        value={value}
        onChange={handleChange}
        label={label}
        displayEmpty={false}
      >
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
        {players.map((player) => (
          <MenuItem key={player.id} value={player.id}>
            {player.name}
            {showStatus && player.status ? ` (${player.status})` : ""}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
