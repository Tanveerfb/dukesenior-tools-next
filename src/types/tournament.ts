export interface LegacyT4Run {
  Officer: string;
  Participant: string;
  Marks: number;
  TimeSubmitted: number;
  [k: string]: any;
}

export interface NormalizedRun {
  id: string;
  tourneyId: string;
  playerOrTeam: string;
  marks: number;
  submittedAt: Date;
  raw: any;
}