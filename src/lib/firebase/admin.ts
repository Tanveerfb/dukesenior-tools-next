import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  try {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    const cred = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
      : applicationDefault();

    initializeApp({ credential: cred, ...(projectId && { projectId }) });
  } catch {
    // ignore init error without creds
  }
}

export const adminAuth = (() => {
  try {
    return getAuth();
  } catch {
    return undefined as any;
  }
})();
export const adminDb = (() => {
  try {
    return getFirestore();
  } catch {
    return undefined as any;
  }
})();

export async function verifyIdToken(idToken?: string) {
  if (!idToken || !adminAuth) return null;
  try {
    return await adminAuth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}
