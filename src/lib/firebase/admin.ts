let adminAuth: any = undefined;
let adminDb: any = undefined;

function tryInit() {
  if (adminAuth !== undefined || adminDb !== undefined) return;
  if (typeof window !== "undefined") return;

  try {
    const { getApps, initializeApp, applicationDefault, cert } =
      eval("require")("firebase-admin/app");
    const { getAuth } = eval("require")("firebase-admin/auth");
    const { getFirestore } = eval("require")("firebase-admin/firestore");

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
        // ignore init failure without credentials
      }
    }

    adminAuth = getAuth();
    adminDb = getFirestore();
  } catch {
    // firebase-admin not present or init failed — callers degrade gracefully
  }
}

export function getAdminAuth() {
  tryInit();
  return adminAuth;
}

export function getAdminDb() {
  tryInit();
  return adminDb;
}

export async function verifyIdToken(idToken?: string) {
  const auth = getAdminAuth();
  if (!idToken || !auth) return null;
  try {
    return await auth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}
