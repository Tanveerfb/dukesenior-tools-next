import { db } from "@/lib/firebase/client";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, increment, limit, orderBy, query, setDoc, where, writeBatch } from "firebase/firestore";

const TOURNEY4_BASE = "Phasmophobia Tourney#4"; // player docs & bracket docs (players, bracket 1, bracket 2, individual players by name)
const TOURNEY4_RECORDS = "Phasmophobia Tourney#4 Records"; // run records
const TOURNEY4_MATCHES = "Phasmophobia Tourney#4 Matches"; // match docs

// Add a player (also assign to bracket list & global players list)
export async function addTourney4Player(params: { name: string; discord: string; twitch: string; prestige: string; timezone: string; bracket: number; }) {
  const { name, discord, twitch, prestige, timezone, bracket } = params;
  const playerRef = doc(db, TOURNEY4_BASE, name.toLowerCase());
  const totalPlayersRef = doc(db, TOURNEY4_BASE, "players");
  const bracketRef = doc(db, TOURNEY4_BASE, `bracket ${bracket}`);
  await setDoc(playerRef, {
    name, discord, twitch, prestige, timezone,
    totalScore: 0, matchesPlayer: 0, matchHistory: [], streak: 0, bestStreak: 0,
    wins: 0, losses: 0, ties: 0, points: 0, bracket
  }, { merge: true });
  await setDoc(totalPlayersRef, { list: arrayUnion(name) }, { merge: true });
  await setDoc(bracketRef, { list: arrayUnion(name) }, { merge: true });
}

export async function getPlayersList() {
  const list: any[] = [];
  const playersSnap = await getDoc(doc(db, TOURNEY4_BASE, "players"));
  const b1Snap = await getDoc(doc(db, TOURNEY4_BASE, "bracket 1"));
  const b2Snap = await getDoc(doc(db, TOURNEY4_BASE, "bracket 2"));
  const playersData: any = playersSnap.data();
  const b1Data: any = b1Snap.data();
  const b2Data: any = b2Snap.data();
  if (playersData?.list) list.push([playersData.list]);
  if (b1Data?.list) list.push([b1Data.list]);
  if (b2Data?.list) list.push([b2Data.list]);
  return list;
}

export async function getPlayerData(playername: string) {
  const d = await getDoc(doc(db, TOURNEY4_BASE, playername));
  return d;
}

export async function tourney4ExportRun(params: {
  officer: string; username: string; evidences: string; cursedItem: string;
  objective1: boolean; objective2: boolean; objective3: boolean;
  ghostPicture: boolean; bonePicture: boolean; cursedItemUse: boolean;
  correctGhost: boolean; survived: boolean; perfectGame: boolean;
  notes: string; marks: number;
}) {
  const timestamp = Date.now();
  const colRef = collection(db, TOURNEY4_RECORDS);
  const docRef = await addDoc(colRef, {
    Officer: params.officer,
    Participant: params.username,
    Evidences: params.evidences,
    CursedItem: params.cursedItem,
    Objective1: params.objective1,
    Objective2: params.objective2,
    Objective3: params.objective3,
    GhostPictureTaken: params.ghostPicture,
    BonePictureTaken: params.bonePicture,
    CursedItemUse: params.cursedItemUse,
    CorrectGhostType: params.correctGhost,
    Survived: params.survived,
    PerfectGame: params.perfectGame,
    AdditionalNotes: params.notes,
    Marks: params.marks,
    TimeSubmitted: timestamp,
  });
  return docRef.id;
}

export async function getPhasmoTourney4Data() {
  const qcol = query(collection(db, TOURNEY4_RECORDS), orderBy("TimeSubmitted", "desc"));
  return getDocs(qcol);
}
export async function getPhasmoTourney4Document(id: string) {
  const d = await getDoc(doc(db, TOURNEY4_RECORDS, id));
  return d.data();
}

export async function getMatchData(matchID: string) {
  const d = await getDoc(doc(db, TOURNEY4_MATCHES, matchID));
  return d.data();
}

// Internal helpers for standings update
async function processWinner(playername: string, marks: number, timestamp: number) {
  const ref = doc(db, TOURNEY4_BASE, playername);
  const snap = await getDoc(ref);
  const currentStreak = snap.exists() ? (snap.data()?.streak || 0) : 0;
  const bestStreak = snap.exists() ? (snap.data()?.bestStreak || 0) : 0;
  const newStreak = currentStreak + 1;
  const updatedBest = Math.max(bestStreak, newStreak);
  const mh = `W ${timestamp}`;
  await setDoc(ref, {
    wins: increment(1), streak: newStreak, bestStreak: updatedBest,
    matchHistory: arrayUnion(mh), totalScore: increment(marks), points: increment(2), matchesPlayer: increment(1)
  }, { merge: true });
}
async function processLoser(playername: string, marks: number, timestamp: number) {
  const ref = doc(db, TOURNEY4_BASE, playername);
  const mh = `L ${timestamp}`;
  await setDoc(ref, {
    losses: increment(1), streak: 0, matchHistory: arrayUnion(mh), totalScore: increment(marks), matchesPlayer: increment(1)
  }, { merge: true });
}
async function processTied(p1: string, p2: string, marks: number, timestamp: number) {
  const mh = `T ${timestamp}`;
  for (const name of [p1, p2]) {
    const ref = doc(db, TOURNEY4_BASE, name);
    await setDoc(ref, {
      ties: increment(1), matchHistory: arrayUnion(mh), totalScore: increment(marks), points: increment(1), matchesPlayer: increment(1)
    }, { merge: true });
  }
}

export async function setMatchRunIDs(matchID: string, player1runID: string, player2RunID: string) {
  const timestamp = Date.now();
  const matchRef = doc(db, TOURNEY4_MATCHES, matchID);
  const run1 = await getPhasmoTourney4Document(player1runID);
  const run2 = await getPhasmoTourney4Document(player2RunID);
  if (!run1 || !run2) throw new Error("Run document missing");
  const player1score = run1.Marks; const player2score = run2.Marks;
  let player1 = run1.Participant; let player2 = run2.Participant;
  let winner = ""; let loser = ""; let tied = false;
  if (player1score > player2score) { winner = player1; loser = player2; await processWinner(winner, player1score, timestamp); await processLoser(loser, player2score, timestamp); }
  else if (player1score === player2score) { tied = true; await processTied(player1, player2, player1score, timestamp); }
  else { winner = player2; loser = player1; await processWinner(winner, player2score, timestamp); await processLoser(loser, player1score, timestamp); }
  await setDoc(matchRef, { player1name: player1, player1runID, player1score, player2name: player2, player2RunID, player2score, tied, winner, loser }, { merge: true });
}

export async function getBracketStandings(bracket: number) {
  const qcol = query(collection(db, TOURNEY4_BASE), where("bracket", "==", bracket), orderBy("points", "desc"));
  return getDocs(qcol);
}
export async function getMostRuns() {
  const qcol = query(collection(db, TOURNEY4_BASE), orderBy("totalScore", "desc"), orderBy("name", "desc"), limit(5));
  const snap = await getDocs(qcol); const list: any[] = []; snap.forEach(d => list.push(d.data())); return list;
}
export async function getAvgRuns() {
  const snap = await getDocs(collection(db, TOURNEY4_BASE));
  let list: any[] = [];
  snap.forEach(docSnap => {
    const player = docSnap.data();
    const avgScore = player.matchesPlayer > 0 ? player.totalScore / player.matchesPlayer : 0;
    list.push({ ...player, avgScore: Number(avgScore.toFixed(2)) });
  });
  list = list.filter(p => p && typeof p === 'object' && 'name' in p);
  list.sort((a, b) => b.avgScore - a.avgScore);
  return list.slice(0, 5);
}
export async function getCurrentStreakStandings() {
  const qcol = query(collection(db, TOURNEY4_BASE), orderBy("streak", "desc"), orderBy("name", "desc"), limit(5));
  const snap = await getDocs(qcol); const list: any[] = []; snap.forEach(d => list.push(d.data())); return list;
}
export async function getBestStreakStandings() {
  const qcol = query(collection(db, TOURNEY4_BASE), orderBy("bestStreak", "desc"), orderBy("name", "desc"), limit(5));
  const snap = await getDocs(qcol); const list: any[] = []; snap.forEach(d => list.push(d.data())); return list;
}

export async function resetTourney4() {
  const playersSnap = await getDocs(collection(db, TOURNEY4_BASE));
  const batch1 = writeBatch(db);
  playersSnap.forEach(p => {
    const ref = doc(db, TOURNEY4_BASE, p.id);
    batch1.update(ref, { totalScore: 0, matchesPlayer: 0, matchHistory: [], streak: 0, bestStreak: 0, wins: 0, losses: 0, ties: 0, points: 0 });
  });
  await batch1.commit();
  const matchesSnap = await getDocs(collection(db, TOURNEY4_MATCHES));
  const batch2 = writeBatch(db);
  matchesSnap.forEach(m => batch2.delete(doc(db, TOURNEY4_MATCHES, m.id)));
  await batch2.commit();
}
