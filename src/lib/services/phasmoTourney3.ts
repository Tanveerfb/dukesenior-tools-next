import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, arrayUnion, increment } from "firebase/firestore";

const TOURNEY3_COLLECTION = "Phasmophobia Tourney#3 Data"; // run documents
const TOURNEY3_TEAMS = "Phasmophobia Tourney #3"; // team documents

// Export (create) a run record and automatically assign points (unless redemption)
export async function tourney3ExportRun(params: {
  officer: string;
  username: string; // team name
  round: string;
  redemption?: boolean;
  ghostPicture: boolean;
  bonePicture: boolean;
  objective1: boolean;
  objective2: boolean;
  objective3: boolean;
  survived: any; // original code stored survived value directly (string or boolean)
  correctGhost: boolean;
  perfectGame: boolean;
  minutes: number;
  seconds: number;
  timeCriteria: string; // e.g. criteria text
  notes: string;
  marks: number;
}) {
  const timestamp = Date.now();
  const documentName = `${timestamp}-${params.username}-${params.round}`;
  const docRef = doc(db, TOURNEY3_COLLECTION, documentName);
  await setDoc(docRef, {
    Officer: params.officer,
    Participant: params.username,
    Round: params.round,
    Redemption: params.redemption ?? false,
    GhostPictureTaken: params.ghostPicture,
    BonePictureTaken: params.bonePicture,
    Objective1: params.objective1,
    Objective2: params.objective2,
    Objective3: params.objective3,
    Survived: params.survived,
    CorrectGhostType: params.correctGhost,
    PerfectGame: params.perfectGame,
    Minutes: params.minutes,
    Seconds: params.seconds,
    Time: params.timeCriteria,
    AdditionalNotes: params.notes,
    Marks: params.marks,
    TimeSubmitted: timestamp,
  });
  await assignPointsToTeam(params.username, params.marks, params.redemption);
  return documentName;
}

export async function getPhasmoTourney3Data() {
  const col = collection(db, TOURNEY3_COLLECTION);
  return getDocs(col);
}

export async function getPhasmoTourney3Document(id: string) {
  const d = await getDoc(doc(db, TOURNEY3_COLLECTION, id));
  return d.data();
}

export async function assignPointsToTeam(teamname: string, points: number, redemption?: boolean) {
  const teamRef = doc(db, TOURNEY3_TEAMS, teamname);
  if (redemption) {
    return setDoc(teamRef, { redemption: arrayUnion(points) }, { merge: true });
  }
  return setDoc(teamRef, { scores: arrayUnion(points), total: increment(points) }, { merge: true });
}

export async function addPlayerToTeam(username: string, team: string, isPlayer1: boolean) {
  const teamRef = doc(db, TOURNEY3_TEAMS, team);
  const id = team.substring(team.length - 1);
  if (isPlayer1) {
    await setDoc(teamRef, { teamID: id, player1: username }, { merge: true });
  } else {
    await setDoc(teamRef, { player2: username }, { merge: true });
  }
}

export async function getStandingsT3() {
  const q = query(collection(db, TOURNEY3_TEAMS), orderBy("total", "desc"));
  const snap = await getDocs(q);
  const list: any[] = [];
  snap.forEach(d => list.push(d.data()));
  return list;
}

export async function getTeamScores(team: string) {
  const d = await getDoc(doc(db, TOURNEY3_TEAMS, team));
  return d.data()?.scores;
}

export async function getTeamRedemptionScores(team: string) {
  const d = await getDoc(doc(db, TOURNEY3_TEAMS, team));
  return d.data()?.redemption;
}

export async function getPlayerListSize() {
  const snap = await getDocs(collection(db, TOURNEY3_TEAMS));
  const list: any[] = [];
  snap.forEach(s => list.push(s.data()));
  return list; // caller can list.length
}
