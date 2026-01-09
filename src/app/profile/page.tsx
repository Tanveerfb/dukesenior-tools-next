"use client";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { getUserByUID, type UserDoc } from "@/lib/services/users";

type Feedback = {
  variant: "success" | "danger" | "info" | "warning";
  message: string;
};

type PendingAction = "display" | "password" | "avatar" | "logout" | null;

export default function ProfilePage() {
  const {
    user,
    resetPassword,
    updateDisplayName,
    logout,
    loading: authLoading,
  } = useAuth();
  const [profileDoc, setProfileDoc] = useState<UserDoc | null>(null);
  const [status, setStatus] = useState<Feedback | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<Feedback | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || authLoading) return;
    let cancelled = false;
    (async () => {
      try {
        const doc = await getUserByUID(user.uid);
        if (cancelled) return;
        setProfileDoc(doc);
        if (doc?.username) {
          router.replace(`/profile/${doc.username}`);
        }
      } catch {
        if (!cancelled) {
          setStatus({
            variant: "danger",
            message:
              "We hit a snag loading your profile. Some details may be missing.",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  const handleDisplayNameUpdate = async () => {
    const input = displayNameRef.current;
    if (!input) return;
    const nextName = input.value.trim();
    if (!nextName) {
      setStatus({
        variant: "warning",
        message: "Enter a display name before saving.",
      });
      return;
    }
    setPending("display");
    try {
      await updateDisplayName(nextName);
      setStatus({ variant: "success", message: "Display name updated." });
      input.value = "";
      router.refresh();
    } catch {
      setStatus({
        variant: "danger",
        message: "Could not update your display name right now.",
      });
    } finally {
      setPending(null);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setPasswordStatus({
        variant: "warning",
        message: "This account does not have an email address on file.",
      });
      return;
    }
    setPending("password");
    try {
      await resetPassword(user.email);
      setPasswordStatus({
        variant: "success",
        message:
          "Password reset email sent. Check your inbox in a few moments.",
      });
    } catch {
      setPasswordStatus({
        variant: "danger",
        message: "Unable to send a reset email. Try again shortly.",
      });
    } finally {
      setPending(null);
    }
  };

  const handleAvatarUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!user || !file) {
      setStatus({
        variant: "warning",
        message: "Choose an image to upload first.",
      });
      return;
    }
    setPending("avatar");
    try {
      const storagePath = `users/${user.uid}/displaypicture`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      (user as any).photoURL = url;
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      setStatus({ variant: "success", message: "Profile picture updated." });
      router.refresh();
    } catch {
      setStatus({
        variant: "danger",
        message: "Image upload failed. Please try again.",
      });
    } finally {
      setPending(null);
    }
  };

  const handleLogout = async () => {
    setPending("logout");
    try {
      await logout();
      router.push("/");
    } finally {
      setPending(null);
    }
  };

  if (authLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm text-center">
          <Card.Body>
            <Card.Title>Sign in to manage your profile</Card.Title>
            <Card.Text className="text-muted">
              Access profile settings, update your details, and manage security
              once you are logged in.
            </Card.Text>
            <Button variant="primary" onClick={() => router.push("/login")}>
              Log in
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const displayName = user.displayName || profileDoc?.displayName || "";
  const emailAddress = user.email || "";
  const avatarUrl = user.photoURL || profileDoc?.photoURL || "";
  const joinedAt = profileDoc?.createdAt
    ? new Date(profileDoc.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const lastSeen = profileDoc?.lastSeen
    ? new Date(profileDoc.lastSeen).toLocaleString()
    : null;
  const initial = (displayName || emailAddress || "U").charAt(0).toUpperCase();

  return (
    <Container className="py-4">
      <Stack gap={3} className="mb-3">
        {status && (
          <Alert
            variant={status.variant}
            dismissible
            onClose={() => setStatus(null)}
            className="mb-0"
          >
            {status.message}
          </Alert>
        )}
      </Stack>
      <Row className="g-4">
        <Col lg={5}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Stack gap={3}>
                <Stack
                  direction="horizontal"
                  gap={3}
                  className="align-items-center"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Profile picture"
                      roundedCircle
                      width={88}
                      height={88}
                    />
                  ) : (
                    <div
                      className="bg-body-secondary text-secondary d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: 88, height: 88, fontSize: "1.75rem" }}
                    >
                      {initial}
                    </div>
                  )}
                  <div>
                    <h2 className="h5 mb-1">{displayName || "Your profile"}</h2>
                    <div className="text-muted small">{emailAddress}</div>
                    <div className="mt-2 d-flex align-items-center gap-2">
                      <Badge bg={user.emailVerified ? "success" : "warning"}>
                        {user.emailVerified
                          ? "Email verified"
                          : "Email not verified"}
                      </Badge>
                    </div>
                  </div>
                </Stack>

                <Form>
                  <Form.Group className="mb-3" controlId="displayName">
                    <Form.Label>Display name</Form.Label>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      <Form.Control
                        type="text"
                        ref={displayNameRef}
                        placeholder={displayName || "Add a name"}
                        maxLength={64}
                        aria-label="Display name"
                      />
                      <Button
                        onClick={handleDisplayNameUpdate}
                        disabled={pending === "display"}
                      >
                        {pending === "display" ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </Stack>
                    <Form.Text className="text-muted">
                      This name appears across tools and community features.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group controlId="avatarUpload">
                    <Form.Label>Profile picture</Form.Label>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        ref={fileRef}
                      />
                      <Button
                        variant="secondary"
                        onClick={handleAvatarUpload}
                        disabled={pending === "avatar"}
                      >
                        {pending === "avatar" ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Upload"
                        )}
                      </Button>
                    </Stack>
                    <Form.Text className="text-muted">
                      Use a square JPG or PNG (2&nbsp;MB max recommended).
                    </Form.Text>
                  </Form.Group>
                </Form>

                <div className="pt-2 border-top small text-muted">
                  {joinedAt && <div>Joined {joinedAt}</div>}
                  {lastSeen && <div>Last seen {lastSeen}</div>}
                  {!profileDoc?.username && (
                    <div>
                      Public username not set. Claim one from your public
                      profile page soon.
                    </div>
                  )}
                </div>
              </Stack>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Stack gap={3}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                  <div>
                    <Card.Title className="h6 mb-1">
                      Account security
                    </Card.Title>
                    <Card.Text className="text-muted small mb-0">
                      Send a password reset link to your email address.
                    </Card.Text>
                  </div>
                  <Button
                    variant="outline-primary"
                    onClick={handlePasswordReset}
                    disabled={pending === "password"}
                  >
                    {pending === "password" ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Send reset email"
                    )}
                  </Button>
                </div>
                {passwordStatus && (
                  <Alert
                    variant={passwordStatus.variant}
                    dismissible
                    onClose={() => setPasswordStatus(null)}
                    className="mt-3 mb-0"
                  >
                    {passwordStatus.message}
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Body className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                <div>
                  <Card.Title className="h6 mb-1">Sign out</Card.Title>
                  <Card.Text className="text-muted small mb-0">
                    Log out of The Lair of Evil on this device.
                  </Card.Text>
                </div>
                <Button
                  variant="outline-danger"
                  onClick={handleLogout}
                  disabled={pending === "logout"}
                >
                  {pending === "logout" ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Log out"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Stack>
        </Col>
      </Row>
    </Container>
  );
}
