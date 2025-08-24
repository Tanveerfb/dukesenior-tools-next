'use client';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { createContext, useContext, useEffect, useState } from 'react';

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

const ADMIN_EMAILS = new Set([
  'dukesenior22@proton.me',
  'flareon@abv.bg'
]);
const ADMIN_UIDS = new Set([
  'GeLWvzA1PxfvGBmvN1niZ2GjHKe2'
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) {
        setAdmin(ADMIN_EMAILS.has(u.email || '') || ADMIN_UIDS.has(u.uid));
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
    updateDisplayName: (name) => updateProfile(auth.currentUser!, { displayName: name }),
    resetPassword: (email) => sendPasswordResetEmail(auth, email, { url: 'https://your-hosted-domain/' })
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}