"use client";
import React, { useRef, useState, useEffect } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
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
        "Invalid username format. Use letters, numbers, underscore (3-32 chars)."
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
              : null
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
              : null
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
    <Container className="py-4">
      <h3>Account</h3>
      {msg && <Alert variant="success">{msg}</Alert>}
      {err && <Alert variant="danger">{err}</Alert>}

      <Form className="mb-3">
        <Form.Group className="mb-2">
          <Form.Label>Upload profile picture</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control type="file" accept="image/*" ref={fileRef} />
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Reserve username</Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="letters, numbers, underscore (3-32)"
              isInvalid={username.length > 0 && !valid}
            />
            <Button onClick={handleReserve} disabled={reserving || !valid}>
              {reserving ? (
                <>
                  <Spinner animation="border" size="sm" /> Reserve
                </>
              ) : (
                "Reserve"
              )}
            </Button>
          </div>
          {username.length > 0 && !valid && (
            <div className="small text-danger mt-1">
              Invalid format — use letters, numbers, underscore (3-32).
            </div>
          )}
          {currentUsername && (
            <div className="small text-muted mt-1">
              Current username: <strong>{currentUsername}</strong>
            </div>
          )}
          {(signInCount !== null || lastSeen) && (
            <div className="small text-muted mt-1">
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
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Password reset</Form.Label>
          <div className="d-flex gap-2">
            <Button
              onClick={() => resetPassword(user?.email)}
              variant="secondary"
            >
              Send reset
            </Button>
          </div>
        </Form.Group>
      </Form>
    </Container>
  );
}
