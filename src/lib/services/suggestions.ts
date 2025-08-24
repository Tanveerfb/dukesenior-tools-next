import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

function suggestionUserPath(user: any) { return `users/${user.email}/suggestions`; }
const adminPath = `admin/support/suggestions`;

export async function addFormToDatabase(category: string, enquiry: string, anonymous: boolean, user: any) {
  const id = Date.now().toString();
  const userCol = collection(db, suggestionUserPath(user));
  const adminCol = collection(db, adminPath);
  await setDoc(doc(userCol, id), { id, category, message: enquiry, anonymous, email: user.email });
  await setDoc(doc(adminCol, id), { id, category, message: enquiry, anonymous, email: user.email });
}

export async function addAdminResponseToForm(id: string, response: string) {
  const adminCol = collection(db, adminPath);
  await setDoc(doc(adminCol, id), { response }, { merge: true });
}

export async function getAllSuggestionsForm(user: any, admin: boolean) {
  const ref = admin ? adminPath : suggestionUserPath(user);
  return getDocs(collection(db, ref));
}

export async function getSuggestionsForm(id: string) {
  return getDoc(doc(collection(db, adminPath), id));
}
