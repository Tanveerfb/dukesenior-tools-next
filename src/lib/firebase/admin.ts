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

  // only attempt to load when running on Node; this entire module may be
  // imported by code that also runs in the browser (e.g. SSR client pieces)
  // so we must avoid letting Webpack/Next try to resolve `firebase-admin`
  // during client-side bundling. using `eval("require")` hides the literal
  // string from the bundler's static analysis.
  if (typeof window !== "undefined") {
    return; // bail early on client
  }

  try {
    // use eval-ified require so the bundler ignores these lines entirely.
    // the `@ts-expect-error` comments are only for TypeScript, not Webpack.
    // allow missing module by swallowing errors.

    const { getApps, initializeApp, applicationDefault } =
      eval("require")("firebase-admin/app");

    const { getAuth } = eval("require")("firebase-admin/auth");

    const { getFirestore } = eval("require")("firebase-admin/firestore");

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
