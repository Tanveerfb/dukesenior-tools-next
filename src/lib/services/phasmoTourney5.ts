import { db } from "@/lib/firebase/client";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const TOURNEY5_RECORDS = "Phasmophobia Tourney#5 Records";

export async function tourney5ExportRun(params: {
  officer: string;
  playerId: string;
  roundId: string;
  notes: string;
  objective1: boolean;
  objective2: boolean;
  objective3: boolean;
  ghostPicture: boolean;
  bonePicture: boolean;
  cursedItemUse: boolean;
  correctGhostType: boolean;
  survived: boolean;
  perfectGame: boolean;
  marks: number;
}) {
  const timestamp = Date.now();
  const colRef = collection(db, TOURNEY5_RECORDS);
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    PlayerId: params.playerId,
    RoundId: params.roundId,
    Notes: params.notes,
    Objective1: params.objective1,
    Objective2: params.objective2,
    Objective3: params.objective3,
    GhostPictureTaken: params.ghostPicture,
    BonePictureTaken: params.bonePicture,
    CursedItemUse: params.cursedItemUse,
    CorrectGhostType: params.correctGhostType,
    Survived: params.survived,
    PerfectGame: params.perfectGame,
    Marks: params.marks,
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listRound5Runs(roundId?: string) {
  const colRef = collection(db, TOURNEY5_RECORDS);
  let qcol;
  if (roundId) {
    qcol = query(
      colRef,
      where("RoundId", "==", roundId),
      orderBy("TimeSubmitted", "asc")
    );
  } else {
    qcol = query(colRef, orderBy("TimeSubmitted", "asc"));
  }
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    playerId: string;
    roundId: string;
    marks: number;
    officer: string;
    createdAt: number;
    notes?: string;
    objective1?: boolean;
    objective2?: boolean;
    objective3?: boolean;
    ghostPicture?: boolean;
    bonePicture?: boolean;
    cursedItemUse?: boolean;
    correctGhostType?: boolean;
    survived?: boolean;
    perfectGame?: boolean;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      playerId: data.PlayerId,
      roundId: data.RoundId || "round1",
      marks: Number(data.Marks || 0),
      officer: data.Officer || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
      notes: data.Notes || "",
      objective1: Boolean(data.Objective1),
      objective2: Boolean(data.Objective2),
      objective3: Boolean(data.Objective3),
      ghostPicture: Boolean(data.GhostPictureTaken),
      bonePicture: Boolean(data.BonePictureTaken),
      cursedItemUse: Boolean(data.CursedItemUse),
      correctGhostType: Boolean(data.CorrectGhostType),
      survived: Boolean(data.Survived),
      perfectGame: Boolean(data.PerfectGame),
    });
  });
  return list;
}

export async function deleteRun(runId: string) {
  const docRef = doc(db, TOURNEY5_RECORDS, runId);
  await deleteDoc(docRef);
}

export async function listRound7Runs() {
  const colRef = collection(db, TOURNEY5_RECORDS);
  const qcol = query(
    colRef,
    where("RoundId", "==", "round7"),
    orderBy("TimeSubmitted", "asc")
  );
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    playerId: string;
    marks: number;
    officer: string;
    createdAt: number;
    notes?: string;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      playerId: data.PlayerId,
      marks: Number(data.Marks || 0),
      officer: data.Officer || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
      notes: data.Notes || "",
    });
  });
  return list;
}

// ----- Round 7 Finale Results -----
const ROUND7_FINALE = "Phasmophobia Tourney#5 Round7 Finale";

export async function addRound7FinaleResult(params: {
  officer: string;
  player1Id: string;
  player2Id: string;
  rows: Array<{
    p1RunId?: string;
    p2RunId?: string;
    outcome: "Player 1" | "Player 2" | "Tie" | "Pending";
  }>;
  winner: "Player 1" | "Player 2" | "Tie" | "Pending";
}) {
  const colRef = collection(db, ROUND7_FINALE);
  const timestamp = Date.now();
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    Player1Id: params.player1Id,
    Player2Id: params.player2Id,
    Rows: params.rows.map((r) => ({
      P1RunId: r.p1RunId || "",
      P2RunId: r.p2RunId || "",
      Outcome: r.outcome,
    })),
    Winner: params.winner,
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listRound7FinaleResults() {
  const colRef = collection(db, ROUND7_FINALE);
  const qcol = query(colRef, orderBy("TimeSubmitted", "asc"));
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    officer: string;
    player1Id: string;
    player2Id: string;
    rows: Array<{ p1RunId?: string; p2RunId?: string; outcome: string }>;
    winner: string;
    createdAt: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      officer: data.Officer || "",
      player1Id: data.Player1Id,
      player2Id: data.Player2Id,
      rows: Array.isArray(data.Rows)
        ? data.Rows.map((r: any) => ({
            p1RunId: r.P1RunId || "",
            p2RunId: r.P2RunId || "",
            outcome: r.Outcome || "Pending",
          }))
        : [],
      winner: data.Winner || "Pending",
      createdAt: Number(data.TimeSubmitted || Date.now()),
    });
  });
  return list;
}

export function computeRound5Marks(input: {
  objective1: boolean;
  objective2: boolean;
  objective3: boolean;
  ghostPicture: boolean;
  bonePicture: boolean;
  survived: boolean;
  correctGhostType: boolean;
  perfectGame: boolean;
}) {
  const objectivesCompleted = [
    input.objective1,
    input.objective2,
    input.objective3,
  ].filter(Boolean).length;
  const objectivePoints = Math.min(objectivesCompleted, 3) * 2; // max 6
  const total =
    objectivePoints +
    (input.ghostPicture ? 5 : 0) +
    (input.bonePicture ? 3 : 0) +
    (input.survived ? 3 : 0) +
    (input.correctGhostType ? 3 : 0) +
    (input.perfectGame ? 5 : 0);
  return Math.min(total, 25);
}

const ROUND2_MONEY = "Phasmophobia Tourney#5 Round2 Money";

export async function addRound2MoneyResult(params: {
  officer: string;
  playerId: string;
  playerName: string;
  money: number;
  notes?: string;
}) {
  const colRef = collection(db, ROUND2_MONEY);
  const timestamp = Date.now();
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    PlayerId: params.playerId,
    PlayerName: params.playerName,
    Money: params.money,
    Notes: params.notes || "",
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listRound2MoneyResults() {
  const colRef = collection(db, ROUND2_MONEY);
  const qcol = query(colRef, orderBy("Money", "desc"));
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    playerId: string;
    playerName: string;
    money: number;
    notes?: string;
    officer: string;
    createdAt: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      playerId: data.PlayerId,
      playerName: data.PlayerName,
      money: Number(data.Money || 0),
      notes: data.Notes || "",
      officer: data.Officer || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
    });
  });
  return list;
}

// ----- Round 3 Teams -----
const ROUND3_TEAMS = "Phasmophobia Tourney#5 Teams";
const ROUND3_TEAM_RUNS = "Phasmophobia Tourney#5 TeamRuns";

export async function upsertTeam(params: {
  teamId?: string;
  teamName: string;
  members: string[]; // exactly two ids
  memberMoney?: Record<string, number>;
}) {
  const id =
    params.teamId || params.teamName.toLowerCase().replace(/\s+/g, "-");
  const ref = doc(db, ROUND3_TEAMS, id);
  await setDoc(
    ref,
    {
      TeamName: params.teamName,
      Members: params.members,
      MemberMoney: params.memberMoney || {},
      UpdatedAt: Date.now(),
    },
    { merge: true }
  );
  return id;
}

export async function deleteTeam(teamId: string) {
  const ref = doc(db, ROUND3_TEAMS, teamId);
  await setDoc(ref, { Deleted: true }, { merge: true });
}

export async function listTeams() {
  const snap = await getDocs(collection(db, ROUND3_TEAMS));
  const list: Array<{
    id: string;
    teamName: string;
    members: string[];
    totalMoney: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    if (data.Deleted) return;
    const memberMoney = (data.MemberMoney || {}) as Record<string, number>;
    const vals = Object.values(memberMoney) as number[];
    const total: number = vals.reduce((acc, v) => acc + Number(v || 0), 0);
    list.push({
      id: d.id,
      teamName: data.TeamName,
      members: data.Members || [],
      totalMoney: total,
    });
  });
  return list;
}

export async function addTeamRunResult(params: {
  officer: string;
  teamId: string;
  teamName: string;
  money: number;
  notes?: string;
}) {
  const colRef = collection(db, ROUND3_TEAM_RUNS);
  const timestamp = Date.now();
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    TeamId: params.teamId,
    TeamName: params.teamName,
    Money: params.money,
    Notes: params.notes || "",
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listTeamRunResults() {
  const colRef = collection(db, ROUND3_TEAM_RUNS);
  const qcol = query(colRef, orderBy("Money", "desc"));
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    teamId: string;
    teamName: string;
    money: number;
    notes?: string;
    officer: string;
    createdAt: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      teamId: data.TeamId,
      teamName: data.TeamName,
      money: Number(data.Money || 0),
      notes: data.Notes || "",
      officer: data.Officer || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
    });
  });
  return list;
}

export async function deleteTeamRunResult(resultId: string) {
  const docRef = doc(db, ROUND3_TEAM_RUNS, resultId);
  await deleteDoc(docRef);
}

// ----- Eliminator -----
const ELIMINATOR = "Phasmophobia Tourney#5 Eliminator";

export async function addEliminatorSession(params: {
  officer: string;
  challengerId: string;
  defenderId: string;
  winnerId: string;
  playerCount?: number;
}) {
  const colRef = collection(db, ELIMINATOR);
  const timestamp = Date.now();
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    ChallengerId: params.challengerId,
    DefenderId: params.defenderId,
    WinnerId: params.winnerId,
    PlayerCount: params.playerCount || null,
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listEliminatorSessions() {
  const snap = await getDocs(collection(db, ELIMINATOR));
  const list: Array<{
    id: string;
    challengerId: string;
    defenderId: string;
    winnerId: string;
    officer: string;
    createdAt: number;
    playerCount?: number | null;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      challengerId: data.ChallengerId,
      defenderId: data.DefenderId,
      winnerId: data.WinnerId,
      officer: data.Officer || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
      playerCount:
        typeof data.PlayerCount === "number" ? data.PlayerCount : null,
    });
  });
  return list;
}

export async function deleteEliminatorSession(sessionId: string) {
  const docRef = doc(db, ELIMINATOR, sessionId);
  await deleteDoc(docRef);
}

// ----- Round 4 Twitch Poll Records -----
const ROUND4_TWITCH_POLLS = "Phasmophobia Tourney#5 Round4 Polls";

export async function addRound4TwitchPollRecord(params: {
  officer: string;
  matchNumber: number;
  playerId: string;
  opponentId: string;
  pollSummary: string;
  imageUrl?: string;
}) {
  const colRef = collection(db, ROUND4_TWITCH_POLLS);
  const timestamp = Date.now();
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    MatchNumber: params.matchNumber,
    PlayerId: params.playerId,
    OpponentId: params.opponentId,
    PollSummary: params.pollSummary,
    ImageUrl: params.imageUrl || "",
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listRound4TwitchPollRecords() {
  const colRef = collection(db, ROUND4_TWITCH_POLLS);
  const qcol = query(colRef, orderBy("MatchNumber", "asc"));
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    officer: string;
    matchNumber: number;
    playerId: string;
    opponentId: string;
    pollSummary: string;
    imageUrl?: string;
    createdAt: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      officer: data.Officer || "",
      matchNumber: Number(data.MatchNumber || 0),
      playerId: data.PlayerId,
      opponentId: data.OpponentId,
      pollSummary: data.PollSummary || "",
      imageUrl: data.ImageUrl || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
    });
  });
  return list;
}

// ----- Round 6 Teams -----
const ROUND6_TEAMS = "Phasmophobia Tourney#5 Round6 Teams";
const ROUND6_TEAM_RUNS = "Phasmophobia Tourney#5 Round6 TeamRuns";

export async function upsertRound6Team(params: {
  teamId?: string;
  teamName: string;
  members: string[]; // exactly two ids
  memberMoney?: Record<string, number>;
}) {
  const id =
    params.teamId || params.teamName.toLowerCase().replace(/\s+/g, "-");
  const ref = doc(db, ROUND6_TEAMS, id);
  await setDoc(
    ref,
    {
      TeamName: params.teamName,
      Members: params.members,
      MemberMoney: params.memberMoney || {},
      UpdatedAt: Date.now(),
    },
    { merge: true }
  );
  return id;
}

export async function deleteRound6Team(teamId: string) {
  const ref = doc(db, ROUND6_TEAMS, teamId);
  await setDoc(ref, { Deleted: true }, { merge: true });
}

export async function listRound6Teams() {
  const snap = await getDocs(collection(db, ROUND6_TEAMS));
  const list: Array<{
    id: string;
    teamName: string;
    members: string[];
    totalMoney: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    if (data.Deleted) return;
    const memberMoney = (data.MemberMoney || {}) as Record<string, number>;
    const vals = Object.values(memberMoney) as number[];
    const total: number = vals.reduce((acc, v) => acc + Number(v || 0), 0);
    list.push({
      id: d.id,
      teamName: data.TeamName,
      members: data.Members || [],
      totalMoney: total,
    });
  });
  return list;
}

export async function addRound6TeamRunResult(params: {
  officer: string;
  teamId: string;
  teamName: string;
  money: number;
  notes?: string;
}) {
  const colRef = collection(db, ROUND6_TEAM_RUNS);
  const timestamp = Date.now();
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    TeamId: params.teamId,
    TeamName: params.teamName,
    Money: params.money,
    Notes: params.notes || "",
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listRound6TeamRunResults() {
  const colRef = collection(db, ROUND6_TEAM_RUNS);
  const qcol = query(colRef, orderBy("Money", "desc"));
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    teamId: string;
    teamName: string;
    money: number;
    notes?: string;
    officer: string;
    createdAt: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      teamId: data.TeamId,
      teamName: data.TeamName,
      money: Number(data.Money || 0),
      notes: data.Notes || "",
      officer: data.Officer || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
    });
  });
  return list;
}

// Round 6: Team run details (Round 1-style scoring per team)
const ROUND6_TEAM_RUN_DETAILS = "Phasmophobia Tourney#5 Round6 TeamRunDetails";

export async function addRound6TeamRunDetail(params: {
  officer: string;
  teamId: string;
  teamName: string;
  notes: string;
  objective1: boolean;
  objective2: boolean;
  objective3: boolean;
  ghostPicture: boolean;
  bonePicture: boolean;
  cursedItemUse: boolean;
  correctGhostType: boolean;
  survived: boolean;
  perfectGame: boolean;
  marks: number;
}) {
  const colRef = collection(db, ROUND6_TEAM_RUN_DETAILS);
  const timestamp = Date.now();
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    TeamId: params.teamId,
    TeamName: params.teamName,
    Notes: params.notes,
    Objective1: params.objective1,
    Objective2: params.objective2,
    Objective3: params.objective3,
    GhostPictureTaken: params.ghostPicture,
    BonePictureTaken: params.bonePicture,
    CursedItemUse: params.cursedItemUse,
    CorrectGhostType: params.correctGhostType,
    Survived: params.survived,
    PerfectGame: params.perfectGame,
    Marks: params.marks,
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listRound6TeamRunDetails() {
  const colRef = collection(db, ROUND6_TEAM_RUN_DETAILS);
  const qcol = query(colRef, orderBy("TimeSubmitted", "asc"));
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    teamId: string;
    teamName: string;
    marks: number;
    notes?: string;
    officer: string;
    createdAt: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      teamId: data.TeamId,
      teamName: data.TeamName,
      marks: Number(data.Marks || 0),
      notes: data.Notes || "",
      officer: data.Officer || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
    });
  });
  return list;
}

export async function deleteRound6TeamRunDetail(detailId: string) {
  const docRef = doc(db, ROUND6_TEAM_RUN_DETAILS, detailId);
  await deleteDoc(docRef);
}

// ----- Video Links -----
const VIDEO_LINKS = "Phasmophobia Tourney#5 VideoLinks";

export async function addVideoLink(params: {
  officer: string;
  title: string;
  url: string;
  platform: "youtube" | "twitch";
  roundId?: string;
  notes?: string;
}) {
  const colRef = collection(db, VIDEO_LINKS);
  const timestamp = Date.now();
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    Title: params.title,
    URL: params.url,
    Platform: params.platform,
    RoundId: params.roundId || "",
    Notes: params.notes || "",
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function listVideoLinks() {
  const colRef = collection(db, VIDEO_LINKS);
  const qcol = query(colRef, orderBy("TimeSubmitted", "desc"));
  const snap = await getDocs(qcol);
  const list: Array<{
    id: string;
    title: string;
    url: string;
    platform: "youtube" | "twitch";
    roundId?: string;
    notes?: string;
    officer: string;
    createdAt: number;
  }> = [];
  snap.forEach((d) => {
    const data: any = d.data();
    list.push({
      id: d.id,
      title: data.Title || "",
      url: data.URL || "",
      platform: (data.Platform as any) || "youtube",
      roundId: data.RoundId || undefined,
      notes: data.Notes || "",
      officer: data.Officer || "",
      createdAt: Number(data.TimeSubmitted || Date.now()),
    });
  });
  return list;
}

export async function deleteVideoLink(linkId: string) {
  const docRef = doc(db, VIDEO_LINKS, linkId);
  await deleteDoc(docRef);
}

