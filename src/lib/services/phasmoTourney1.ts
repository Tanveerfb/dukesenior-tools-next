import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export async function tourneyDataExport(
  officerName: string,
  participantName: string,
  mapName: string,
  ghostpicture: boolean,
  bonepicture: boolean,
  curseditemuse: boolean,
  objective1: boolean,
  objective2: boolean,
  objective3: boolean,
  stars: string,
  survival: boolean,
  correcttype: boolean,
  notes: string
) {
  const timestamp = Date.now();
  const documentName = `${participantName}_${timestamp}_${officerName}`;
  const docRef = doc(db, "Phasmophobia Tourney#1 Data", documentName);
  return setDoc(docRef, {
    Officer: officerName,
    Participant: participantName,
    Map: mapName,
    GhostPictureTaken: ghostpicture,
    BonePictureTaken: bonepicture,
    CursedItemUsed: curseditemuse,
    Objective1: objective1,
    Objective2: objective2,
    Objective3: objective3,
    PhotoStars: stars,
    Survived: survival,
    CorrectGhostType: correcttype,
    AdditionalNotes: notes,
  });
}

export async function getPhasmoTourneyData() {
  const phasmodb = collection(db, "Phasmophobia Tourney#1 Data");
  return getDocs(phasmodb);
}

export async function getPhasmoTourneyDocument(documentID: string) {
  const docRef = doc(db, "Phasmophobia Tourney#1 Data", documentID);
  const snap = await getDoc(docRef);
  return snap.data();
}
