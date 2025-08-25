import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Uses applicationDefault credentials (set GOOGLE_APPLICATION_CREDENTIALS) or fallback no-op if missing.
if (!getApps().length) {
  try {
    initializeApp({ credential: applicationDefault() });
  } catch {
    // ignore init error in local without creds
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
