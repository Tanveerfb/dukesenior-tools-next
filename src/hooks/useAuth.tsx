"use client";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  user: any;
  admin: boolean;
  loading: boolean;
  login(email: string, password: string): Promise<any>;
  signup(email: string, password: string): Promise<any>;
  logout(): Promise<void>;
  updateDisplayName(name: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ADMIN_EMAILS = new Set(["dukesenior22@proton.me", "flareon@abv.bg"]);
const ADMIN_UIDS = new Set(["GeLWvzA1PxfvGBmvN1niZ2GjHKe2"]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setAdmin(ADMIN_EMAILS.has(u.email || "") || ADMIN_UIDS.has(u.uid));
        // update a detailed summary record in Firestore each time the user signs in
        // non-blocking fire-and-forget; failures are logged to console
        (async function updateUserRecord(signedInUser) {
          try {
            if (!signedInUser?.uid) return;
            const ref = doc(db, "users", signedInUser.uid);
            const snap = await getDoc(ref);

            // derive provider (auth method)
            const provider =
              (signedInUser.providerData &&
                signedInUser.providerData[0] &&
                signedInUser.providerData[0].providerId) ||
              signedInUser.providerId ||
              "unknown";

            // device info (client-side)
            const userAgent =
              typeof navigator !== "undefined" ? navigator.userAgent : "";
            const platform =
              typeof navigator !== "undefined" ? navigator.platform : "";

            // try to fetch public IP (best-effort, non-blocking)
            let ip = null;
            try {
              const resp = await fetch("https://api.ipify.org?format=json");
              if (resp.ok) {
                const j = await resp.json();
                ip = j?.ip || null;
              }
            } catch (err) {
              console.log(err);
            }

            const payload: any = {
              uid: signedInUser.uid,
              email: signedInUser.email || "",
              displayName: signedInUser.displayName || "",
              photoURL: signedInUser.photoURL || "",
              lastSeen: serverTimestamp(),
              lastSignInAt: serverTimestamp(),
              lastSignInMethod: provider,
              lastSignInIP: ip,
              deviceAgent: userAgent,
              devicePlatform: platform,
              // increment a sign-in counter safely
              signInCount: increment(1),
            };
            if (!snap.exists()) payload.createdAt = serverTimestamp();
            await setDoc(ref, payload, { merge: true });
          } catch (e) {
            console.error("updateUserRecord error", e);
          }
        })(u);
      } else {
        setAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value: AuthContextValue = {
    user,
    admin,
    loading,
    login: (e, p) => signInWithEmailAndPassword(auth, e, p),
    signup: (e, p) => createUserWithEmailAndPassword(auth, e, p),
    logout: () => signOut(auth),
    updateDisplayName: (name) =>
      updateProfile(auth.currentUser!, { displayName: name }),
    resetPassword: (email) =>
      sendPasswordResetEmail(auth, email, {
        url: "https://your-hosted-domain/",
      }),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
