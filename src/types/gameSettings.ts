// Game settings schema for Phasmophobia-style configuration
// Derived from provided images for Player, Ghost, and Contract tabs

export type OnOff = "On" | "Off";
export type LowMediumHigh = "Low" | "Medium" | "High";

export type Weather =
  | "Clear"
  | "Sunny"
  | "Foggy"
  | "Windy"
  | "Rain"
  | "Snow"
  | "Thunderstorm";

export type CursedPossession =
  | "Tarot Cards"
  | "Monkey Paw"
  | "Ouija Board"
  | "Haunted Mirror"
  | "Music Box"
  | "Summoning Circle"
  | "Voodoo Doll";

export interface PlayerSettings {
  startingSanity: number; // 0-100
  sanityPillRestorationPercent: number; // 0-100
  sanityDrainSpeedPercent: number; // e.g., 0-300
  sprinting: OnOff;
  playerSpeedPercent: number; // e.g., 50-150
  flashlights: OnOff;
  loseItemsAndConsumables: OnOff;
}

export interface GhostSettings {
  ghostSpeedPercent: number; // e.g., 50-150
  roamingFrequency: LowMediumHigh;
  changingFavouriteRoom: LowMediumHigh;
  activityLevel: LowMediumHigh;
  eventFrequency: LowMediumHigh;
  friendlyGhost: OnOff;
  gracePeriodSeconds: number; // 0-5
  huntDuration: LowMediumHigh; // abstracted as Low/Med/High per image
  evidenceGiven: 0 | 1 | 2 | 3; // number of evidences
  fingerprintChancePercent: number; // 0-100
  fingerprintDurationSeconds: number; // seconds
}

export interface ContractSettings {
  setupTimeSeconds: number;
  weather: Weather;
  doorsStartingOpen: LowMediumHigh;
  numberOfHidingPlaces: LowMediumHigh;
  sanityMonitor: OnOff;
  activityMonitor: OnOff;
  fuseBoxAtStartOfContract: OnOff;
  fuseBoxVisibleOnMap: OnOff;
  cursedPossession: CursedPossession | "Random" | "None";
  mapName?: string; // Optional map selection per round
}

export interface RoundMetaSettings {
  scoreSystemAssigned?: boolean; // Admin can assign/unassign scoring rubric for round
}

export interface GameSettings {
  player: PlayerSettings;
  ghost: GhostSettings;
  contract: ContractSettings;
  meta?: RoundMetaSettings;
}

export const defaultGameSettings: GameSettings = {
  player: {
    startingSanity: 75,
    sanityPillRestorationPercent: 10,
    sanityDrainSpeedPercent: 200,
    sprinting: "On",
    playerSpeedPercent: 100,
    flashlights: "On",
    loseItemsAndConsumables: "On",
  },
  ghost: {
    ghostSpeedPercent: 100,
    roamingFrequency: "High",
    changingFavouriteRoom: "High",
    activityLevel: "Low",
    eventFrequency: "High",
    friendlyGhost: "Off",
    gracePeriodSeconds: 0,
    huntDuration: "High",
    evidenceGiven: 1,
    fingerprintChancePercent: 100,
    fingerprintDurationSeconds: 60,
  },
  contract: {
    setupTimeSeconds: 0,
    weather: "Windy",
    doorsStartingOpen: "High",
    numberOfHidingPlaces: "Low",
    sanityMonitor: "On",
    activityMonitor: "Off",
    fuseBoxAtStartOfContract: "Off",
    fuseBoxVisibleOnMap: "Off",
    cursedPossession: "Random",
    mapName: undefined,
  },
  meta: {
    scoreSystemAssigned: false,
  },
};
