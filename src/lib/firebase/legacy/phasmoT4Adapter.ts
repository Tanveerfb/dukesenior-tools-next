import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../client";
import { NormalizedRun, LegacyT4Run } from "@/types/tournament";

const T4_RECORDS = "Phasmophobia Tourney#4 Records";

export async function fetchTourney4Runs(): Promise<NormalizedRun[]> {
  const qRef = query(
    collection(db, T4_RECORDS),
    orderBy("TimeSubmitted", "desc")
  );
  const snap = await getDocs(qRef);
  return snap.docs.map((d) => {
    const data = d.data() as LegacyT4Run;
    return {
      id: d.id,
      tourneyId: "phasmo-4",
      playerOrTeam: data.Participant,
      marks: data.Marks,
      submittedAt: new Date(data.TimeSubmitted),
      raw: data,
    };
  });
}
