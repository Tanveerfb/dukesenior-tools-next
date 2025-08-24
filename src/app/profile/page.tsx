"use client";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Container, Form, Image } from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { db, storage } from "@/lib/firebase/client";
import { collection, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, resetPassword, updateDisplayName, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [mainAlert, setMainAlert] = useState<string | null>(null);
  const [passwordAlert, setPasswordAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function fetchdata() {
    if (!user) return;
    const usersCollection = collection(db, "users");
    const userRef = doc(usersCollection, user.email);
    const snap = await getDoc(userRef);
    setData(snap.data());
  }
  useEffect(() => { fetchdata(); }, [user]);

  async function handlePasswordReset() {
    if (!user) return;
    setLoading(true);
    try {
      await resetPassword(user.email);
      setPasswordAlert("Password reset link sent.");
    } finally { setLoading(false); }
  }
  async function handleUpdateDisplay() {
    if (!displayNameRef.current?.value) return;
    setLoading(true);
    try { await updateDisplayName(displayNameRef.current.value); setMainAlert("Display name updated"); }
    finally { setLoading(false); }
  }
  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }
  async function handleDP() {
    if (!user || !fileRef.current?.files?.[0]) return;
    setLoading(true);
    try {
      const path = `users/${user.uid}/displaypicture`;
      const r = ref(storage, path);
      await uploadBytes(r, fileRef.current.files[0]);
      const url = await getDownloadURL(r);
      await updateDisplayName(user.displayName || ""); // refresh only
      (user as any).photoURL = url;
      router.refresh();
    } finally { setLoading(false); }
  }

  return (
    <>
      {mainAlert && <Container className="pb-3"><Alert>{mainAlert}</Alert></Container>}
      <Container fluid="lg" className="p-2 d-flex flex-column flex-lg-row">
        <Container className="p-2">
          {data && (
            <Form className="p-2">
              {user?.photoURL ? (
                <Container className="d-flex justify-content-center">
                  <Image src={user.photoURL} className="avatar" roundedCircle alt="avatar" />
                </Container>
              ) : <Alert>No profile picture uploaded</Alert>}
              <Form.Group className="mb-3">
                <Form.Label>Upload new profile picture</Form.Label>
                <div className="d-flex flex-column flex-md-row gap-2">
                  <Form.Control type="file" accept="image/*" ref={fileRef} />
                  <Button onClick={handleDP} disabled={loading}>Upload</Button>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Text>Email address</Form.Text>
                <Form.Control type="email" value={data.Email} readOnly />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Text>Display name</Form.Text>
                <div className="d-flex flex-column flex-md-row gap-2">
                  <Form.Control type="text" placeholder={data.Display} ref={displayNameRef} />
                  <Button onClick={handleUpdateDisplay} disabled={loading}>Update</Button>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Text>Email verified?</Form.Text>
                <Form.Control value={data.Verified ? "Yes" : "No"} readOnly />
              </Form.Group>
            </Form>
          )}
        </Container>
        <Container className="d-flex flex-column justify-content-center gap-3">
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Password reset</Card.Title>
              {passwordAlert ? <Alert variant="success">{passwordAlert}</Alert> : <Card.Text>Reset your password by email.</Card.Text>}
            </Card.Body>
            <Card.Footer>
              <Button disabled={loading} onClick={handlePasswordReset} variant="primary">Reset password</Button>
            </Card.Footer>
          </Card>
          <Card className="text-center p-2">
            <Card.Body><Card.Text>Log out of your account.</Card.Text></Card.Body>
            <Card.Footer><Button disabled={loading} onClick={handleLogout} variant="danger">Log out</Button></Card.Footer>
          </Card>
        </Container>
      </Container>
    </>
  );
}

