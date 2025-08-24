import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

const userRolesCollection = collection(db, 'userRoles');

export async function tourney2Admission(userUID: string, admit: string) {
  const userDoc = doc(userRolesCollection, userUID);
  const admission = admit === 'true';
  return setDoc(userDoc, { PhasmoTourney2: admission }, { merge: true });
}
export async function checkTourney2Admission(userUID: string) {
  const userDoc = doc(userRolesCollection, userUID);
  const data = await getDoc(userDoc);
  return data.data()?.PhasmoTourney2;
}

export async function tourney2DataExport(
  officerName: string,
  participantName: string,
  mapName: string,
  ghostpicture: boolean,
  bonepicture: boolean,
  objective1: boolean,
  objective2: boolean,
  objective3: boolean,
  survival: boolean,
  correcttype: boolean,
  perfectgame: boolean,
  minutes: string,
  seconds: string,
  notes: string
) {
  const timestamp = Date.now();
  const documentName = `${participantName.toLowerCase()}_${timestamp}_${officerName}`;
  const docRef = doc(db, 'Phasmophobia Tourney#2 Data', documentName);
  return setDoc(docRef, {
    Officer: officerName,
    Participant: participantName,
    Map: mapName,
    GhostPictureTaken: ghostpicture,
    BonePictureTaken: bonepicture,
    Objective1: objective1,
    Objective2: objective2,
    Objective3: objective3,
    Survived: survival,
    CorrectGhostType: correcttype,
    PerfectGame: perfectgame,
    GameTime: `${minutes} : ${seconds}`,
    AdditionalNotes: notes,
  });
}
export async function getPhasmoTourney2Document(documentID: string) {
  const docRef = doc(db, 'Phasmophobia Tourney#2 Data', documentID);
  const data = await getDoc(docRef);
  return data.data();
}
export async function getPhasmoTourney2Data() {
  const phasmodb = collection(db, 'Phasmophobia Tourney#2 Data');
  return getDocs(phasmodb);
}
