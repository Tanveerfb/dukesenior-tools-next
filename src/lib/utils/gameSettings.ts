import type { GameSettings, CursedPossession } from "../../types/gameSettings";

export const CURSED_POSSESSIONS: CursedPossession[] = [
  "Tarot Cards",
  "Monkey Paw",
  "Ouija Board",
  "Haunted Mirror",
  "Music Box",
  "Summoning Circle",
  "Voodoo Doll",
];

export function formatGameSettings(
  settings: GameSettings
): Record<string, string | number> {
  return {
    "Starting sanity": settings.player.startingSanity,
    "Sanity Pill restoration (%)": settings.player.sanityPillRestorationPercent,
    "Sanity drain speed (%)": settings.player.sanityDrainSpeedPercent,
    Sprinting: settings.player.sprinting,
    "Player speed (%)": settings.player.playerSpeedPercent,
    Flashlights: settings.player.flashlights,
    "Lose items and consumables": settings.player.loseItemsAndConsumables,
    "Ghost speed (%)": settings.ghost.ghostSpeedPercent,
    "Roaming frequency": settings.ghost.roamingFrequency,
    "Changing favourite room": settings.ghost.changingFavouriteRoom,
    "Activity level": settings.ghost.activityLevel,
    "Event frequency": settings.ghost.eventFrequency,
    "Friendly ghost": settings.ghost.friendlyGhost,
    "Grace period (s)": settings.ghost.gracePeriodSeconds,
    "Hunt duration (s)": settings.ghost.huntDuration,
    "Evidence given": settings.ghost.evidenceGiven,
    "Fingerprint chance (%)": settings.ghost.fingerprintChancePercent,
    "Fingerprint duration (s)": settings.ghost.fingerprintDurationSeconds,
    "Setup time (s)": settings.contract.setupTimeSeconds,
    Weather: settings.contract.weather,
    "Doors starting open": settings.contract.doorsStartingOpen,
    "Number of hiding places": settings.contract.numberOfHidingPlaces,
    "Sanity monitor": settings.contract.sanityMonitor,
    "Activity monitor": settings.contract.activityMonitor,
    "Fuse box at start of contract": settings.contract.fuseBoxAtStartOfContract,
    "Fuse box visible on map": settings.contract.fuseBoxVisibleOnMap,
    "Cursed Possessions": settings.contract.cursedPossession,
  };
}

export function isValidCursedPossession(
  value: string
): value is CursedPossession {
  return (CURSED_POSSESSIONS as string[]).includes(value);
}
