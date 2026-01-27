export interface TournamentMeta {
  id: string;
  title: string;
  shortTitle: string;
  format: string;
  winner?: string;
  participants: number;
  totalMatches: number;
  year: number;
  status: "completed" | "ongoing";
  themeColor: string;
  description: string;
}

export interface BracketNode {
  id: string;
  round: number;
  match: number;
  player1?: string;
  player2?: string;
  score1?: number;
  score2?: number;
  winner?: string;
  nextMatchId?: string;
}

export interface TournamentOverview {
  id: string;
  title: string;
  format: string;
  description: string;
  winner?: string;
  runnerUp?: string;
  participants: number;
  totalMatches: number;
  year: number;
  highlights: string[];
}
