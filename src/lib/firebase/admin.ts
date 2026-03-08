// runtime wrapper around firebase-admin that avoids a hard dependency.
// the original project used the admin SDK for token verification and
// server‑side Firestore access. we still export the same symbols but they
// will be `null`/`undefined` if the `firebase-admin` package isn't
// installed or fails to initialize. this allows the client to uninstall
// the package entirely and simply fall back to the web SDK instead.

let adminAuth: any = undefined;

let adminDb: any = undefined;

function tryInit() {
  // avoid running twice
  if (adminAuth !== undefined || adminDb !== undefined) return;

  try {
    // use require so TypeScript doesn't try to resolve these at compile time
    // and so that the module can be missing without crashing the build.
    // allow require here because the package may be missing

    // @ts-expect-error allow missing module
    const {
      getApps,
      initializeApp,
      applicationDefault,
    } = require("firebase-admin/app");

    // @ts-expect-error allow missing module
    const { getAuth } = require("firebase-admin/auth");

    // @ts-expect-error allow missing module
    const { getFirestore } = require("firebase-admin/firestore");

    // once we have the constructors we can grab instances for later reuse
    adminAuth = getAuth();
    adminDb = getFirestore();

    if (!getApps().length) {
      try {
        const cred = applicationDefault();
        const projectId =
          process.env.FIREBASE_PROJECT_ID ||
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (projectId) {
          initializeApp({ credential: cred, projectId });
        } else {
          initializeApp({ credential: cred });
        }
      } catch {
        // ignore init failure in local/no-credentials environment
      }
    }
  } catch (_err) {
    // package not present or some other error; leave values null so callers
    // can detect absence and degrade gracefully. we intentionally swallow the
    // error because initialization is optional and occurs at runtime.
  }
}

/**
 * Returns the initialized Auth instance or `null` if unavailable.
 */
export function getAdminAuth() {
  tryInit();
  return adminAuth;
}

/**
 * Returns the initialized Firestore instance or `null` if unavailable.
 */
export function getAdminDb() {
  tryInit();
  return adminDb;
}

/**
 * Convenience export for compatibility with existing call sites that
 * previously imported `verifyIdToken` directly from this module.
 */
export async function verifyIdToken(idToken?: string) {
  const auth = getAdminAuth();
  if (!idToken || !auth) return null;
  try {
    return await auth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}
