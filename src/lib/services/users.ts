import { db } from '@/lib/firebase/client';
import { doc, getDoc, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';

export interface UserDoc {
  uid: string;
  displayName?: string;
  username?: string;
  photoURL?: string;
  bio?: string;
  createdAt?: number;
  updatedAt?: number;
  lastSeen?: number;
  signInCount?: number;
}

const USERS_COL = 'users';
const USERNAME_COL = 'usernames';

export function normalizeUsername(s: string) {
  return (s || '').trim().toLowerCase();
}

export function validateUsername(s: string) {
  return /^[A-Za-z0-9_]{3,32}$/.test(s);
}

function toMillisIfTimestamp(v: any): number | undefined {
  if (!v) return undefined;
  if (typeof v === 'number') return v;
  if (v && typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v === 'string') {
    const p = Date.parse(v);
    if (!Number.isNaN(p)) return p;
  }
  return undefined;
}

function normalizeDoc(raw: any): UserDoc | null {
  if (!raw) return null;
  const out: any = { ...raw };
  try {
    out.createdAt = toMillisIfTimestamp(raw.createdAt || raw.CreatedAt || raw.createAt);
  } catch {}
  try {
    out.updatedAt = toMillisIfTimestamp(raw.updatedAt || raw.updated || raw.updated_at);
  } catch {}
  try {
    out.lastSeen = toMillisIfTimestamp(raw.lastSeen || raw.last_seen || raw.lastSignInAt || raw.lastSignIn);
  } catch {}
  try {
    out.lastSignInAt = toMillisIfTimestamp(raw.lastSignInAt || raw.lastSignIn || raw.last_sign_in_at);
  } catch {}
  return out as UserDoc;
}

export async function getUserByUID(uid: string): Promise<UserDoc | null> {
  if (!uid) return null;

  // Prefer admin SDK on server to avoid mixing SDK refs
  if (typeof window === 'undefined') {
    try {
      const { adminDb } = await import('@/lib/firebase/admin');
      if (adminDb) {
        try {
          const snap = await adminDb.collection(USERS_COL).doc(uid).get();
          if (snap.exists) return normalizeDoc(snap.data());
        } catch {}

        // try alternate field queries for legacy docs
        try {
          const snaps = await adminDb.collection(USERS_COL).where('uid', '==', uid).get();
          if (!snaps.empty) return normalizeDoc(snaps.docs[0].data());
        } catch {}
        try {
          const snapsUID = await adminDb.collection(USERS_COL).where('UID', '==', uid).get();
          if (!snapsUID.empty) return normalizeDoc(snapsUID.docs[0].data());
        } catch {}
        try {
          const snaps2 = await adminDb.collection(USERS_COL).where('Email', '==', uid).get();
          if (!snaps2.empty) return normalizeDoc(snaps2.docs[0].data());
        } catch {}
        try {
          const snaps3 = await adminDb.collection(USERS_COL).where('email', '==', uid).get();
          if (!snaps3.empty) return normalizeDoc(snaps3.docs[0].data());
        } catch {}
      }
    } catch {
      // dynamic import failed — fall back to client path below
    }
  }

  // Client-side fallback using client SDK
  try {
    const ref = doc(db, USERS_COL, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return normalizeDoc(snap.data());
  } catch {}

  try {
    const q = query(collection(db, USERS_COL), where('uid', '==', uid));
    const snaps = await getDocs(q);
    if (!snaps.empty) return normalizeDoc(snaps.docs[0].data());
  } catch {}

  try {
    const qUID = query(collection(db, USERS_COL), where('UID', '==', uid));
    const snapsUID = await getDocs(qUID);
    if (!snapsUID.empty) return normalizeDoc(snapsUID.docs[0].data());
  } catch {}

  try {
    const q2 = query(collection(db, USERS_COL), where('Email', '==', uid));
    const snaps2 = await getDocs(q2);
    if (!snaps2.empty) return normalizeDoc(snaps2.docs[0].data());
  } catch {}

  try {
    const q3 = query(collection(db, USERS_COL), where('email', '==', uid));
    const snaps3 = await getDocs(q3);
    if (!snaps3.empty) return normalizeDoc(snaps3.docs[0].data());
  } catch {}

  return null;
}

export async function getUserByUsername(username: string): Promise<UserDoc | null> {
  const uname = normalizeUsername(username);
  if (!uname) return null;

  if (typeof window === 'undefined') {
    try {
      const { adminDb } = await import('@/lib/firebase/admin');
      if (adminDb) {
        try {
          const mapSnap = await adminDb.collection(USERNAME_COL).doc(uname).get();
          if (!mapSnap.exists) return null;
          const data = mapSnap.data() as any;
          const uid = data?.uid as string | undefined;
          if (!uid) return null;
          return getUserByUID(uid);
        } catch {}
      }
    } catch {}
  }

  try {
    const mapRef = doc(db, USERNAME_COL, uname);
    const mapSnap = await getDoc(mapRef);
    if (!mapSnap.exists()) return null;
    const data = mapSnap.data() as any;
    const uid = data?.uid as string | undefined;
    if (!uid) return null;
    return getUserByUID(uid);
  } catch {
    return null;
  }
}

// Transactionally claim a username and update the user's doc.
// Throws Error('invalid_username') or Error('username_taken') on failure.
export async function setUsername(uid: string, username: string, displayName?: string) {
  const uname = normalizeUsername(username);
  if (!validateUsername(uname)) throw new Error('invalid_username');

  if (typeof window === 'undefined') {
    try {
      const { adminDb } = await import('@/lib/firebase/admin');
      if (adminDb) {
        try {
          await adminDb.runTransaction(async (tx: any) => {
            const unameRef = adminDb.collection(USERNAME_COL).doc(uname);
            const userRef = adminDb.collection(USERS_COL).doc(uid);
            const unameSnap = await tx.get(unameRef);
            if (unameSnap.exists && (unameSnap.data() as any).uid !== uid) {
              throw new Error('username_taken');
            }

            const now = Date.now();
            const userSnap = await tx.get(userRef);
            if (!userSnap.exists) {
              tx.set(userRef, { uid, username: uname, displayName: displayName || '', createdAt: now, updatedAt: now });
            } else {
              tx.update(userRef, { username: uname, displayName: displayName ?? (userSnap.data() as any).displayName, updatedAt: now } as any);
            }

            tx.set(unameRef, { uid, username: uname, createdAt: (unameSnap.exists ? (unameSnap.data() as any).createdAt : now), updatedAt: now }, { merge: true } as any);
          });
          return { uid, username: uname };
        } catch (err: any) {
          if (err?.message === 'username_taken') throw err;
          // fall through to client path if admin transaction failed for unexpected reason
        }
      }
    } catch {}
  }

  // Client-side transaction fallback
  const userRef = doc(db, USERS_COL, uid);
  const unameRef = doc(db, USERNAME_COL, uname);

  await runTransaction(db, async (tx) => {
    const unameSnap = await tx.get(unameRef);
    if (unameSnap.exists()) {
      const existing = unameSnap.data() as any;
      if (existing.uid !== uid) throw new Error('username_taken');
    }

    const now = Date.now();
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) {
      tx.set(userRef, { uid, username: uname, displayName: displayName || '', createdAt: now, updatedAt: now });
    } else {
      tx.update(userRef, { username: uname, displayName: displayName ?? (userSnap.data() as any).displayName, updatedAt: now } as any);
    }

    tx.set(unameRef, { uid, username: uname, createdAt: (unameSnap.exists() ? (unameSnap.data() as any).createdAt : now), updatedAt: now }, { merge: true } as any);
  });

  return { uid, username: uname };
}
