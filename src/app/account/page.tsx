"use client";
import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export default function AccountPage() {
  const { user, updateDisplayName, resetPassword } = useAuth();
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean>(false);
  const [signInCount, setSignInCount] = useState<number | null>(null);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleReserve() {
    setErr(null);
    setMsg(null);
    if (!user) return setErr("Not signed in");

    const uname = (username || "").trim();
    if (!/^[A-Za-z0-9_]{3,32}$/.test(uname))
      return setErr(
        "Invalid username format. Use letters, numbers, underscore (3-32 chars).",
      );
    if (
      currentUsername &&
      currentUsername.toLowerCase() === uname.toLowerCase()
    )
      return setErr("That is already your username.");

    setReserving(true);
    try {
      // correctly invoke Firebase user token function
      const token = await (user.getIdToken
        ? user.getIdToken()
        : user.getIdToken?.bind(user)
          ? user.getIdToken()
          : null);
      // If token is a function, call it
      const idToken = typeof token === "function" ? await token() : token;
      if (!idToken) return setErr("Not authenticated");

      const res = await fetch("/api/users/username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ username: uname }),
      });
      const json = await res.json();
      if (!res.ok) {
        // surface server message for debugging
        const map: Record<string, string> = {
          username_taken: "That username is already taken.",
          invalid_username:
            "Invalid username (3-32 characters, letters/numbers/underscore).",
        };
        const message = json?.message || json?.error || "Reservation failed";
        return setErr(map[json?.error] || message);
      }
      setMsg("Username reserved");
      // reload user doc to ensure fields are present
      try {
        const refDoc = doc(db, "users", user.uid);
        const snap2 = await getDoc(refDoc);
        if (snap2.exists()) {
          const d: any = snap2.data();
          setCurrentUsername(d.username || uname);
          setSignInCount(
            typeof d.signInCount === "number"
              ? d.signInCount
              : d.signInCount
                ? Number(d.signInCount)
                : null,
          );
          // prefer lastSeen or lastSignInAt
          setLastSeen(d.lastSeen || d.lastSignInAt || null);
        }
      } catch {
        // intentionally ignored - best-effort reload of user doc
      }
    } catch (e: any) {
      setErr(e.message || "Reservation error");
    }
    setReserving(false);
  }

  async function handleUpload() {
    if (!user || !fileRef.current?.files?.[0]) return;
    const path = `users/${user.uid}/displaypicture`;
    const r = ref(storage, path);
    await uploadBytes(r, fileRef.current.files[0]);
    await getDownloadURL(r); // result intentionally unused here; storage updated
    await updateDisplayName(user.displayName || "");
    setMsg("Uploaded");
  }

  // load current username from users/{uid}
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user?.uid) return;
      try {
        const refDoc = doc(db, "users", user.uid);
        const snap = await getDoc(refDoc);
        if (mounted && snap.exists()) {
          const d: any = snap.data();
          if (d.username) setCurrentUsername(d.username as string);
          setSignInCount(
            typeof d.signInCount === "number"
              ? d.signInCount
              : d.signInCount
                ? Number(d.signInCount)
                : null,
          );
          setLastSeen(d.lastSeen || d.lastSignInAt || null);
        }
      } catch (_e) {
        /* ignore */
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  // live validation
  useEffect(() => {
    const uname = (username || "").trim();
    setValid(/^[A-Za-z0-9_]{3,32}$/.test(uname));
  }, [username]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <h3 className="text-xl font-semibold mb-4">Account</h3>
      {msg && (
        <div className="mb-3 rounded-lg border border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300 px-4 py-3">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-3 rounded-lg border border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 px-4 py-3">
          {err}
        </div>
      )}

      <form className="mb-3">
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">
            Upload profile picture
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg"
            />
            <button
              type="button"
              onClick={handleUpload}
              className="rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            >
              Upload
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">
            Reserve username
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="letters, numbers, underscore (3-32)"
              className={cn(
                "block w-full rounded-lg border px-3 py-2 text-sm bg-background dark:bg-background-dark text-foreground",
                username.length > 0 && !valid
                  ? "border-red-500 focus:ring-red-500"
                  : "border-border dark:border-border-dark focus:ring-primary-500",
              )}
            />
            <button
              type="button"
              onClick={handleReserve}
              disabled={reserving || !valid}
              className="rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {reserving ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Reserve
                </span>
              ) : (
                "Reserve"
              )}
            </button>
          </div>
          {username.length > 0 && !valid && (
            <p className="text-sm text-red-500 mt-1">
              Invalid format — use letters, numbers, underscore (3-32).
            </p>
          )}
          {currentUsername && (
            <p className="text-sm text-foreground-secondary mt-1">
              Current username: <strong>{currentUsername}</strong>
            </p>
          )}
          {(signInCount !== null || lastSeen) && (
            <p className="text-sm text-foreground-secondary mt-1">
              {signInCount !== null && (
                <span>
                  Sign-ins: <strong>{signInCount}</strong>
                </span>
              )}
              {signInCount !== null && lastSeen && <span> · </span>}
              {lastSeen && (
                <span>
                  Last seen:{" "}
                  <strong>{new Date(lastSeen).toLocaleString()}</strong>
                </span>
              )}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">
            Password reset
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => resetPassword(user?.email)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-foreground px-4 py-2 text-sm font-medium transition-colors"
            >
              Send reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
