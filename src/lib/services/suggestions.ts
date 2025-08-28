import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

function suggestionUserPath(user: any) { return `users/${user.email}/suggestions`; }
const adminPath = `admin/support/suggestions`;

export async function addFormToDatabase(category: string, enquiry: string, anonymous: boolean, user: any) {
  const id = Date.now().toString();
  const adminCol = collection(db, adminPath);

  // Base payload - include server timestamp and optionally uid/email when allowed
  const ts = Date.now();
  const baseData: any = { id, category, message: enquiry, anonymous, createdAt: ts };

  // If we have a user object and the submission is not anonymous, include identifying info
  if (user && user.email && !anonymous) {
    baseData.email = user.email;
  }
  if (user && user.uid && !anonymous) {
    baseData.uid = user.uid;
  }

  // Write admin copy
  await setDoc(doc(adminCol, id), baseData);

  // Write per-user copy only when we have a user with an email
  if (user && user.email) {
    const userCol = collection(db, suggestionUserPath(user));
    // For the per-user copy, omit email if user requested anonymity
    const userData = { ...baseData };
    if (anonymous) {
      delete userData.email;
      delete userData.uid;
    }
    await setDoc(doc(userCol, id), userData);
  }
}

export async function addAdminResponseToForm(id: string, response: string, responderUid?: string) {
  const adminCol = collection(db, adminPath);
  const payload: any = { response };
  // record responder metadata when available
  if (responderUid) payload.responderUid = responderUid;
  payload.respondedAt = Date.now();
  await setDoc(doc(adminCol, id), payload, { merge: true });
}

export async function getAllSuggestionsForm(user: any, admin: boolean) {
  const ref = admin ? adminPath : suggestionUserPath(user);
  return getDocs(collection(db, ref));
}

export async function getSuggestionsForm(id: string) {
  return getDoc(doc(collection(db, adminPath), id));
}

export async function archiveSuggestion(id: string, archived: boolean = true) {
  const adminCol = collection(db, adminPath);
  await setDoc(doc(adminCol, id), { archived }, { merge: true });
}

export async function deleteSuggestion(id: string) {
  const adminCol = collection(db, adminPath);
  // delete admin copy
  await (await import('firebase/firestore')).deleteDoc(doc(adminCol, id));
}
