// Service skeleton for Phasmo Tourney 5
// Follow established patterns: keep Firestore access here (not in components)

import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export interface WildcardOption {
  id: string; // unique key
  label: string; // e.g., "No Flashlight", "No Sanity Pills"
  description?: string;
}

export interface PlayerRoundState {
  name: string;
  selectedWildcard?: string; // id
  marks?: number; // score/marks for round
  runTimeMs?: number; // total time taken used for immunity tie-break
  immune?: boolean; // derived after scores
  votedFor?: string; // name they voted to nominate
  nominated?: boolean; // this player is nominated by vote outcome
  challenge?: { opponent: string; result?: "won" | "lost" } | null;
  eliminated?: boolean; // set after challenge elimination
}

export interface Round1Config {
  wildcardPool: WildcardOption[]; // provided by admin
  players: string[]; // 8 players list for the round
}

// Default wildcard pool for Round 1 (can be overridden via config/admin)
export const ROUND1_DEFAULT_WILDCARDS: WildcardOption[] = [
  { id: "add-one-more-evidence", label: "Add 1 more evidence" },
  {
    id: "grace-period",
    label: "Grace Period",
    description: "Temporary hunt-free window (duration TBD: e.g., 2–3 min)",
  },
  { id: "add-random-cursed-item", label: "Add 1 more random cursed item" },
  {
    id: "better-sanity-pills",
    label: "Better sanity pills",
    description: "Enhanced sanity restore (exact value TBD)",
  },
  { id: "all-tier-3-equipment", label: "All Tier 3 equipment" },
  {
    id: "add-setup-time",
    label: "Add Setup time",
    description: "Pre-run setup time (duration TBD)",
  },
];

// --- Firestore collection/doc names ---
const T5_R1_STATE = "t5Round1State";
const T5_R1_CHOICES = "t5Round1Choices";
const T5_PLAYERS = "t5Players";
// Voting sessions collection root (new design)
const T5_VOTING_SESSIONS = "t5VotingSessions"; // session docs
// Votes stored in subcollection: t5VotingSessions/{sessionId}/votes/{voterUid}

export interface PlayerChoicesDoc {
  player: string;
  choices: string[];
  generatedAt: number;
}

// Persist and fetch helpers (Round 1)
export async function getRound1State(player: string) {
  const ref = doc(collection(db, T5_R1_STATE), player.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as PlayerRoundState) : null;
}
export async function setRound1State(
  player: string,
  update: Partial<PlayerRoundState>
) {
  const ref = doc(collection(db, T5_R1_STATE), player.toLowerCase());
  const payload = { name: player, ...update } as PlayerRoundState;
  await setDoc(ref, payload, { merge: true });
  const snap = await getDoc(ref);
  return snap.data() as PlayerRoundState;
}
export async function getRound1Choices(player: string) {
  const ref = doc(collection(db, T5_R1_CHOICES), player.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as PlayerChoicesDoc) : null;
}
export async function drawRound1Choices(
  player: string,
  pool: WildcardOption[] = ROUND1_DEFAULT_WILDCARDS
) {
  const trio = drawWildcardChoices(pool).map((c) => c.id);
  const ref = doc(collection(db, T5_R1_CHOICES), player.toLowerCase());
  const docVal: PlayerChoicesDoc = {
    player,
    choices: trio,
    generatedAt: Date.now(),
  };
  await setDoc(ref, docVal, { merge: true });
  return docVal;
}
export async function saveRound1Selection(player: string, wildcardId: string) {
  return setRound1State(player, { selectedWildcard: wildcardId });
}
export async function recordRound1Run(
  player: string,
  marks: number,
  runTimeMs: number
) {
  return setRound1State(player, { marks, runTimeMs });
}

// --- Player profile helpers ---
export interface T5PlayerProfile {
  preferredName: string;
  twitch?: string;
  youtube?: string;
  steam?: string;
  phasmoHours?: number;
  prestigeAtAdmission?: string;
  previousTourney?: boolean;
  createdAt: number;
}

export async function addT5Player(profile: Omit<T5PlayerProfile, "createdAt">) {
  const id = profile.preferredName.toLowerCase();
  const ref = doc(collection(db, T5_PLAYERS), id);
  const payload: T5PlayerProfile = { ...profile, createdAt: Date.now() };
  await setDoc(ref, payload, { merge: false });
  return payload;
}

export async function getT5Player(name: string) {
  const ref = doc(collection(db, T5_PLAYERS), name.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as T5PlayerProfile) : null;
}

export async function listT5Players(): Promise<T5PlayerProfile[]> {
  const snap = await getDocs(collection(db, T5_PLAYERS));
  const out: T5PlayerProfile[] = [];
  snap.forEach((d: any) => out.push(d.data() as T5PlayerProfile));
  // Sort alphabetically by preferredName for stable UI
  out.sort((a, b) => a.preferredName.localeCompare(b.preferredName));
  return out;
}

// ---- Runs & basic standings (similar pattern to Tourney4) ----
// Minimal run document structure for Round 1 submissions; can be extended later.
const T5_RUNS = "t5Runs";
export interface T5RunRecord {
  id?: string;
  player: string;
  marks: number;
  runTimeMs: number;
  wildcard?: string; // chosen wildcard at time of run
  submittedAt: number;
}

export async function addT5Run(params: {
  player: string;
  marks: number;
  runTimeMs: number;
  wildcard?: string;
}) {
  const { player, marks, runTimeMs, wildcard } = params;
  const ref = doc(collection(db, T5_RUNS));
  const payload: T5RunRecord = {
    player,
    marks,
    runTimeMs,
    wildcard,
    submittedAt: Date.now(),
  };
  await setDoc(ref, payload);
  return { ...payload, id: ref.id };
}

export async function getT5Runs(limitCount = 100) {
  // Simple manual pagination placeholder: fetch all for now, sort by submittedAt desc
  const snap = await getDocs(collection(db, T5_RUNS));
  const list: T5RunRecord[] = [];
  snap.forEach((d: any) =>
    list.push({ ...(d.data() as T5RunRecord), id: d.id })
  );
  list.sort((a, b) => b.submittedAt - a.submittedAt);
  return list.slice(0, limitCount);
}

export interface T5PlayerAggregate {
  player: string;
  totalMarks: number;
  runs: number;
  avgMarks: number;
  bestMarks: number;
}
export function aggregateT5Standings(runs: T5RunRecord[]): T5PlayerAggregate[] {
  const map = new Map<string, { total: number; count: number; best: number }>();
  for (const r of runs) {
    const rec = map.get(r.player) || { total: 0, count: 0, best: 0 };
    rec.total += r.marks;
    rec.count += 1;
    rec.best = Math.max(rec.best, r.marks);
    map.set(r.player, rec);
  }
  return Array.from(map.entries())
    .map(([player, v]) => ({
      player,
      totalMarks: v.total,
      runs: v.count,
      avgMarks: v.count ? Number((v.total / v.count).toFixed(2)) : 0,
      bestMarks: v.best,
    }))
    .sort(
      (a, b) => b.totalMarks - a.totalMarks || a.player.localeCompare(b.player)
    );
}

// Pure helper: generate 3 unique wildcard options for a player from pool
export function drawWildcardChoices(
  pool: WildcardOption[],
  rng: () => number = Math.random
): WildcardOption[] {
  const list = [...pool];
  // Fisher-Yates partial shuffle to take first 3
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, 3);
}

// Compute immunity (top 2) with user-defined tie-break rules:
// 1) Higher marks first.
// 2) If marks tie, shorter runTimeMs wins.
// 3) If still tie, alphabetical by name.
export function computeRound1Immunity(
  states: PlayerRoundState[]
): PlayerRoundState[] {
  const ranked = [...states]
    .map((s) => ({
      ...s,
      marks: s.marks ?? 0,
      runTimeMs: s.runTimeMs ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => {
      if (a.marks !== b.marks) return b.marks! - a.marks!; // desc marks
      if (a.runTimeMs !== b.runTimeMs) return a.runTimeMs! - b.runTimeMs!; // asc time
      return a.name.localeCompare(b.name);
    });
  const immuneNames = new Set(ranked.slice(0, 2).map((r) => r.name));
  return states.map((s) => ({ ...s, immune: immuneNames.has(s.name) }));
}

export interface VotingOutcome {
  nominated: string | null; // final nominated player or null
  needsRevote: boolean; // true if immunity lost & revote required
  tieCandidates?: string[]; // list of players in tie (pre-revote)
  immunityLost?: boolean; // immune players lost immunity due to second tie
}

// Voting logic per user specification:
// First tally. If tie -> (conceptually) immune players help decide; we model a second tally externally.
// If still tied after second pass -> immunityLost=true and needsRevote=true, revote among tieCandidates.
export function computeVotingOutcome(
  states: PlayerRoundState[]
): VotingOutcome {
  const counts = new Map<string, number>();
  for (const s of states) {
    if (!s.votedFor) continue;
    counts.set(s.votedFor, (counts.get(s.votedFor) || 0) + 1);
  }
  if (counts.size === 0) return { nominated: null, needsRevote: false };
  const entries = Array.from(counts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
  const topCount = entries[0][1];
  const tied = entries.filter((e) => e[1] === topCount).map((e) => e[0]);
  if (tied.length === 1) return { nominated: tied[0], needsRevote: false };
  // Second pass would be performed externally; if still tied return revote signal
  return {
    nominated: null,
    needsRevote: true,
    tieCandidates: tied,
    immunityLost: true,
  };
}

// Pure helper: resolve a challenge between nominated and chosen opponent
export function resolveChallenge(
  nominated: PlayerRoundState,
  opponent: PlayerRoundState
): { eliminated: string; updated: [PlayerRoundState, PlayerRoundState] } {
  // Compare marks; if equal, break tie alphabetically (admin can override later)
  const nMarks = nominated.marks ?? 0;
  const oMarks = opponent.marks ?? 0;
  let loser = "";
  if (nMarks === oMarks) {
    loser = [nominated.name, opponent.name].sort()[1];
  } else loser = nMarks < oMarks ? nominated.name : opponent.name;
  const n: PlayerRoundState = {
    ...nominated,
    challenge: {
      opponent: opponent.name,
      result: (loser === nominated.name ? "lost" : "won") as "won" | "lost",
    },
  };
  const o: PlayerRoundState = {
    ...opponent,
    challenge: {
      opponent: nominated.name,
      result: (loser === opponent.name ? "lost" : "won") as "won" | "lost",
    },
  };
  return { eliminated: loser, updated: [n, o] };
}

// ---- Phase management helpers ----
export type Round1Phase =
  | "selection"
  | "runs"
  | "immunityLocked"
  | "voting"
  | "revote"
  | "challenge"
  | "complete";

export function nextPhase(current: Round1Phase): Round1Phase {
  switch (current) {
    case "selection":
      return "runs";
    case "runs":
      return "immunityLocked";
    case "immunityLocked":
      return "voting";
    case "voting":
      return "challenge";
    case "revote":
      return "challenge";
    case "challenge":
      return "complete";
    default:
      return "complete";
  }
}

// Firestore-backed methods (stubs) - to be implemented when data is ready
// export async function saveRound1Selection(player: string, wildcardId: string) { /* ... */ }
// export async function recordRun(player: string, marks: number) { /* ... */ }
// export async function recordVote(voter: string, candidate: string) { /* ... */ }
// export async function finalizeNomination() { /* ... */ }
// export async function performChallenge(nominated: string, opponent: string) { /* ... */ }

// ---- Voting sessions (anonymous voting via session link) ----
// Voting session logic removed - placeholder exports (delete on new implementation)
// (Intentionally no-op stubs retained to avoid import errors until UI cleaned.)
export interface T5VotingSession {
  id?: string;
  round: number;
  immunePlayerIds: string[]; // players marked immune BEFORE opening session
  candidatePlayerIds: string[]; // players eligible to be voted (excludes immune)
  revealOrder: string[]; // persisted random order to flip/reveal on results page
  createdAt: number;
  closedAt?: number;
  open: boolean;
  revealed?: boolean; // when true, public results can show counts immediately
}

// Create a voting session: admin supplies round and immune list. We derive candidates & revealOrder.
export async function createVotingSession(
  round: number,
  immunePlayerIds: string[]
): Promise<T5VotingSession> {
  const allPlayers = await listT5Players();
  const allNames = allPlayers.map((p) => p.preferredName);
  const immuneSet = new Set(immunePlayerIds);
  const candidatePlayerIds = allNames.filter((n) => !immuneSet.has(n));
  // Persist a randomized reveal order of candidates for results flip UI
  const revealOrder = shuffleArray(candidatePlayerIds);
  const ref = doc(collection(db, T5_VOTING_SESSIONS));
  const session: T5VotingSession = {
    round,
    immunePlayerIds: [...immuneSet],
    candidatePlayerIds,
    revealOrder,
    createdAt: Date.now(),
    open: true,
  };
  await setDoc(ref, session);
  return { ...session, id: ref.id };
}

export async function getVotingSession(
  sessionId: string
): Promise<T5VotingSession | null> {
  const ref = doc(collection(db, T5_VOTING_SESSIONS), sessionId);
  const snap = await getDoc(ref);
  return snap.exists()
    ? { ...(snap.data() as T5VotingSession), id: snap.id }
    : null;
}

export async function listVotingSessions(
  round?: number
): Promise<T5VotingSession[]> {
  const snap = await getDocs(collection(db, T5_VOTING_SESSIONS));
  const list: T5VotingSession[] = [];
  snap.forEach((d: any) =>
    list.push({ ...(d.data() as T5VotingSession), id: d.id })
  );
  if (typeof round === "number") {
    return list
      .filter((s) => s.round === round)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

// One vote per UID per session. Store vote doc id = voterUid for simple existence check (anonymity preserved in API responses).
export async function castVote(
  sessionId: string,
  voterUid: string,
  candidateId: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await getVotingSession(sessionId);
  if (!session) return { ok: false, error: "Session not found" };
  if (!session.open) return { ok: false, error: "Session closed" };
  if (!session.candidatePlayerIds.includes(candidateId))
    return { ok: false, error: "Invalid candidate" };
  if (session.immunePlayerIds.includes(candidateId))
    return { ok: false, error: "Candidate is immune" };
  const voteRef = doc(
    collection(db, `${T5_VOTING_SESSIONS}/${sessionId}/votes`),
    voterUid
  );
  const existing = await getDoc(voteRef);
  if (existing.exists()) return { ok: false, error: "Already voted" };
  await setDoc(voteRef, { candidateId, createdAt: Date.now() });
  return { ok: true };
}

export async function closeVotingSession(
  sessionId: string
): Promise<{ ok: boolean; error?: string }> {
  const ref = doc(collection(db, T5_VOTING_SESSIONS), sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false, error: "Session not found" };
  const data = snap.data() as T5VotingSession;
  if (!data.open) return { ok: false, error: "Already closed" };
  const updated: Partial<T5VotingSession> = {
    open: false,
    closedAt: Date.now(),
  };
  await setDoc(ref, updated, { merge: true });
  return { ok: true };
}

export interface VotingTally {
  sessionId: string;
  counts: { candidateId: string; votes: number }[];
  totalVotes: number;
  open: boolean;
  round: number;
}
export async function getVotingTally(
  sessionId: string
): Promise<VotingTally | null> {
  const session = await getVotingSession(sessionId);
  if (!session) return null;
  const votesSnap = await getDocs(
    collection(db, `${T5_VOTING_SESSIONS}/${sessionId}/votes`)
  );
  const countsMap = new Map<string, number>();
  votesSnap.forEach((d: any) => {
    const candidate = d.data().candidateId as string;
    countsMap.set(candidate, (countsMap.get(candidate) || 0) + 1);
  });
  const counts = session.candidatePlayerIds.map((c) => ({
    candidateId: c,
    votes: countsMap.get(c) || 0,
  }));
  const totalVotes = Array.from(countsMap.values()).reduce((a, b) => a + b, 0);
  counts.sort(
    (a, b) => b.votes - a.votes || a.candidateId.localeCompare(b.candidateId)
  );
  return {
    sessionId,
    counts,
    totalVotes,
    open: session.open,
    round: session.round,
  };
}

// Utility: simple array shuffle
function shuffleArray<T>(arr: T[], rng: () => number = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---- Round 2: Money Round ----
// Players do one run on a different map. Only money value is recorded. No eliminations here.
const T5_R2 = "t5Round2";
export interface T5Round2Entry {
  player: string;
  money: number; // final money value from game summary
  map?: string; // optional map name for context
  notes?: string; // optional text (e.g., allowed settings used)
  submittedAt: number;
}

// Upsert a player's Round 2 money entry (doc id = player lowercase). Last write wins.
export async function recordRound2Money(args: {
  player: string;
  money: number;
  map?: string;
  notes?: string;
}): Promise<T5Round2Entry> {
  const id = args.player.toLowerCase();
  const ref = doc(collection(db, T5_R2), id);
  const payload: T5Round2Entry = {
    player: args.player,
    money: Math.max(0, Math.floor(args.money || 0)),
    map: args.map,
    notes: args.notes,
    submittedAt: Date.now(),
  };
  await setDoc(ref, payload, { merge: true });
  const snap = await getDoc(ref);
  return snap.data() as T5Round2Entry;
}

export async function getRound2Entry(
  player: string
): Promise<T5Round2Entry | null> {
  const ref = doc(collection(db, T5_R2), player.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as T5Round2Entry) : null;
}

export async function listRound2Money(): Promise<T5Round2Entry[]> {
  const snap = await getDocs(collection(db, T5_R2));
  const list: T5Round2Entry[] = [];
  snap.forEach((d: any) => list.push(d.data() as T5Round2Entry));
  return list.sort(
    (a, b) => b.money - a.money || a.player.localeCompare(b.player)
  );
}

// ---- Round 3: Team Up Round (7 players) ----
// Non-anonymous partner vote; form 3 teams + 1 leftover (auto-immune next vote).
// Then a team money round (combined money per team). Lowest team goes to elimination; two players face off; one eliminated.

const T5_R3_VOTES = "t5Round3Votes"; // doc id = voter (lowercase): { voter, partner, submittedAt }
const T5_R3_TEAMS = "t5Round3Teams"; // doc id = members sorted join: { members: string[], combinedMoney?, map?, submittedAt? }
const T5_R3_META = "t5Round3Meta"; // single doc 'state': { eligiblePlayers: string[], leftover?: string, finalizedAt?: number }
const T5_R3_ELIM = "t5Round3Elimination"; // doc id = teamId: { players:[a,b], aMoney?, bMoney?, resolved?, eliminated? }
const T5_R3_IMM = "t5Round3Immunity"; // doc id = playerLower: { player, immune, updatedAt }

export interface T5Round3Vote {
  voter: string;
  partner: string;
  submittedAt: number;
}
export interface T5Round3Team {
  members: [string, string];
  combinedMoney?: number;
  map?: string;
  submittedAt?: number;
}
export interface T5Round3Meta {
  eligiblePlayers: string[];
  leftover?: string;
  finalizedAt?: number;
}

export async function recordRound3Vote(
  voter: string,
  partner: string
): Promise<T5Round3Vote> {
  const v = voter.trim();
  const p = partner.trim();
  if (!v || !p) throw new Error("Missing voter or partner");
  if (v.toLowerCase() === p.toLowerCase())
    throw new Error("Cannot vote for self");
  const ref = doc(collection(db, T5_R3_VOTES), v.toLowerCase());
  const payload: T5Round3Vote = {
    voter: v,
    partner: p,
    submittedAt: Date.now(),
  };
  await setDoc(ref, payload, { merge: true });
  return payload;
}

export async function listRound3Votes(): Promise<T5Round3Vote[]> {
  const snap = await getDocs(collection(db, T5_R3_VOTES));
  const list: T5Round3Vote[] = [];
  snap.forEach((d: any) => list.push(d.data() as T5Round3Vote));
  return list;
}

function teamIdFor(members: string[]): string {
  return [...members]
    .map((s) => s.toLowerCase())
    .sort()
    .join("__");
}

export interface Round3TeamsResult {
  teams: [string, string][];
  leftover: string;
}

export async function finalizeRound3Teams(
  eligiblePlayers: string[]
): Promise<Round3TeamsResult> {
  if (!eligiblePlayers || eligiblePlayers.length !== 7) {
    throw new Error("eligiblePlayers must contain 7 names");
  }
  const pool = eligiblePlayers.map((s) => s.trim()).filter(Boolean);
  const votes = await listRound3Votes();
  const voteMap = new Map<string, string>();
  for (const v of votes) {
    if (
      pool.some((p) => p.toLowerCase() === v.voter.toLowerCase()) &&
      pool.some((p) => p.toLowerCase() === v.partner.toLowerCase())
    ) {
      voteMap.set(v.voter.toLowerCase(), v.partner);
    }
  }
  const unassigned = new Set(pool.map((p) => p.toLowerCase()));
  const nameByLower = new Map(pool.map((p) => [p.toLowerCase(), p] as const));
  const teams: [string, string][] = [];

  // 1) Lock mutual pairs
  for (const [vLower, partner] of voteMap.entries()) {
    const pLower = partner.toLowerCase();
    if (!unassigned.has(vLower) || !unassigned.has(pLower)) continue;
    const partnerChoice = voteMap.get(pLower);
    if (partnerChoice && partnerChoice.toLowerCase() === vLower) {
      teams.push([nameByLower.get(vLower)!, nameByLower.get(pLower)!]);
      unassigned.delete(vLower);
      unassigned.delete(pLower);
    }
    if (teams.length === 3) break;
  }

  // 2) Greedy pair by popularity (incoming votes)
  while (teams.length < 3 && unassigned.size >= 2) {
    // compute incoming counts among unassigned
    const incoming = new Map<string, string[]>(); // partnerLower -> [voterLower]
    for (const [vLower, partner] of voteMap.entries()) {
      if (!unassigned.has(vLower)) continue;
      const pLower = partner.toLowerCase();
      if (!unassigned.has(pLower)) continue;
      const arr = incoming.get(pLower) || [];
      arr.push(vLower);
      incoming.set(pLower, arr);
    }
    let chosenPair: [string, string] | null = null;
    if (incoming.size > 0) {
      const popular = Array.from(incoming.entries()).sort(
        (a, b) => b[1].length - a[1].length
      )[0];
      const partnerLower = popular[0];
      const voterLower = popular[1][0];
      if (unassigned.has(voterLower) && unassigned.has(partnerLower)) {
        chosenPair = [
          nameByLower.get(voterLower)!,
          nameByLower.get(partnerLower)!,
        ];
      }
    }
    if (!chosenPair) {
      // fallback: pick two alphabetically
      const arr = Array.from(unassigned.values()).sort();
      chosenPair = [nameByLower.get(arr[0])!, nameByLower.get(arr[1])!];
    }
    teams.push(chosenPair);
    unassigned.delete(chosenPair[0].toLowerCase());
    unassigned.delete(chosenPair[1].toLowerCase());
  }

  const leftoverLower = Array.from(unassigned.values())[0];
  const leftover = leftoverLower ? nameByLower.get(leftoverLower)! : "";

  // Persist teams
  for (const t of teams) {
    const id = teamIdFor(t);
    const ref = doc(collection(db, T5_R3_TEAMS), id);
    const payload: T5Round3Team = { members: [t[0], t[1]] };
    await setDoc(ref, payload, { merge: true });
  }
  const metaRef = doc(collection(db, T5_R3_META), "state");
  const meta: T5Round3Meta = {
    eligiblePlayers: pool,
    leftover,
    finalizedAt: Date.now(),
  };
  await setDoc(metaRef, meta, { merge: true });
  return { teams, leftover };
}

export async function listRound3Teams(): Promise<{
  teams: T5Round3Team[];
  leftover?: string;
}> {
  const snap = await getDocs(collection(db, T5_R3_TEAMS));
  const teams: T5Round3Team[] = [];
  snap.forEach((d: any) => teams.push(d.data() as T5Round3Team));
  const metaSnap = await getDoc(doc(collection(db, T5_R3_META), "state"));
  const leftover = metaSnap.exists()
    ? (metaSnap.data() as T5Round3Meta).leftover
    : undefined;
  return { teams, leftover };
}

export async function submitRound3TeamRun(args: {
  members: [string, string];
  money: number;
  map?: string;
}): Promise<T5Round3Team> {
  const id = teamIdFor(args.members as unknown as string[]);
  const ref = doc(collection(db, T5_R3_TEAMS), id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Team not found");
  const payload: Partial<T5Round3Team> = {
    combinedMoney: Math.max(0, Math.floor(args.money || 0)),
    map: args.map,
    submittedAt: Date.now(),
  };
  await setDoc(ref, payload, { merge: true });
  const updated = await getDoc(ref);
  return updated.data() as T5Round3Team;
}

export async function listRound3Scoreboard(): Promise<T5Round3Team[]> {
  const snap = await getDocs(collection(db, T5_R3_TEAMS));
  const list: T5Round3Team[] = [];
  snap.forEach((d: any) => list.push(d.data() as T5Round3Team));
  return list.sort((a, b) => (b.combinedMoney || 0) - (a.combinedMoney || 0));
}

// Elimination phase helpers
export async function startRound3Elimination(teamMembers: [string, string]) {
  const id = teamIdFor(teamMembers as unknown as string[]);
  const ref = doc(collection(db, T5_R3_ELIM), id);
  const payload = {
    players: [teamMembers[0], teamMembers[1]],
    startedAt: Date.now(),
  };
  await setDoc(ref, payload, { merge: true });
  return { teamId: id };
}

export async function submitRound3EliminationRun(args: {
  teamMembers: [string, string];
  player: string;
  money: number;
}) {
  const id = teamIdFor(args.teamMembers as unknown as string[]);
  const ref = doc(collection(db, T5_R3_ELIM), id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Elimination not started");
  const docVal = snap.data() as any;
  const pLower = args.player.toLowerCase();
  const [a, b] = (docVal.players as string[]).map((s) => s.toLowerCase());
  const patch: any = {};
  if (pLower === a) patch.aMoney = Math.max(0, Math.floor(args.money || 0));
  else if (pLower === b)
    patch.bMoney = Math.max(0, Math.floor(args.money || 0));
  else throw new Error("Player not in elimination pair");
  await setDoc(ref, patch, { merge: true });
  return { teamId: id };
}

export async function resolveRound3Elimination(teamMembers: [string, string]) {
  const id = teamIdFor(teamMembers as unknown as string[]);
  const ref = doc(collection(db, T5_R3_ELIM), id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Elimination not started");
  const data = snap.data() as any;
  const [a, b] = data.players as [string, string];
  const aMoney = data.aMoney || 0;
  const bMoney = data.bMoney || 0;
  let eliminated = "";
  if (aMoney === bMoney) {
    eliminated = [a, b].sort()[1];
  } else {
    eliminated = aMoney < bMoney ? a : b;
  }
  await setDoc(
    ref,
    { resolved: true, eliminated, resolvedAt: Date.now() },
    { merge: true }
  );
  return { eliminated };
}

// Manual admin override to directly set teams & leftover (bypassing vote algorithm)
export async function setRound3Teams(
  teams: [string, string][],
  leftover?: string
) {
  for (const t of teams) {
    const id = teamIdFor(t as unknown as string[]);
    await setDoc(
      doc(collection(db, T5_R3_TEAMS), id),
      { members: [t[0], t[1]] },
      { merge: true }
    );
  }
  const metaRef = doc(collection(db, T5_R3_META), "state");
  await setDoc(metaRef, { leftover, finalizedAt: Date.now() }, { merge: true });
  return { ok: true };
}

export async function setRound3Immunity(player: string, immune: boolean) {
  const p = player.trim();
  if (!p) throw new Error("Missing player");
  const ref = doc(collection(db, T5_R3_IMM), p.toLowerCase());
  await setDoc(
    ref,
    { player: p, immune: !!immune, updatedAt: Date.now() },
    { merge: true }
  );
  return { player: p, immune: !!immune };
}

export async function listRound3Immunity(): Promise<
  Array<{ player: string; immune: boolean }>
> {
  const snap = await getDocs(collection(db, T5_R3_IMM));
  const rows: Array<{ player: string; immune: boolean }> = [];
  snap.forEach((d: any) => {
    const v = d.data() as any;
    rows.push({ player: v.player, immune: !!v.immune });
  });
  return rows;
}
