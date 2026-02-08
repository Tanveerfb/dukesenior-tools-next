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
import { getUserByUID, updateUserProfile, type UserDoc } from "@/lib/services/users";

type Feedback = {
  variant: "success" | "danger" | "info" | "warning";
  message: string;
};

type PendingAction = "display" | "password" | "avatar" | "banner" | "profile" | "logout" | null;

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
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const pronounsRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const timezoneRef = useRef<HTMLInputElement>(null);
  const accentColorRef = useRef<HTMLInputElement>(null);
  const discordRef = useRef<HTMLInputElement>(null);
  const twitchRef = useRef<HTMLInputElement>(null);
  const twitterRef = useRef<HTMLInputElement>(null);
  const youtubeRef = useRef<HTMLInputElement>(null);
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

  const handleBannerUpload = async () => {
    const file = bannerFileRef.current?.files?.[0];
    if (!user || !file) {
      setStatus({
        variant: "warning",
        message: "Choose a banner image to upload first.",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setStatus({
        variant: "danger",
        message: "Banner image must be less than 5MB.",
      });
      return;
    }

    setPending("banner");
    try {
      const storagePath = `users/${user.uid}/banner`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateUserProfile(user.uid, { bannerURL: url });
      if (bannerFileRef.current) {
        bannerFileRef.current.value = "";
      }
      setStatus({ variant: "success", message: "Banner image updated." });
      // Reload profile doc
      const doc = await getUserByUID(user.uid);
      setProfileDoc(doc);
      router.refresh();
    } catch {
      setStatus({
        variant: "danger",
        message: "Banner upload failed. Please try again.",
      });
    } finally {
      setPending(null);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setPending("profile");
    try {
      // Filter out empty social links
      const socialLinks: Record<string, string> = {};
      if (discordRef.current?.value) socialLinks.discord = discordRef.current.value;
      if (twitchRef.current?.value) socialLinks.twitch = twitchRef.current.value;
      if (twitterRef.current?.value) socialLinks.twitter = twitterRef.current.value;
      if (youtubeRef.current?.value) socialLinks.youtube = youtubeRef.current.value;

      const updates: Partial<UserDoc> = {
        bio: bioRef.current?.value || "",
        pronouns: pronounsRef.current?.value || "",
        location: locationRef.current?.value || "",
        timezone: timezoneRef.current?.value || "",
        accentColor: accentColorRef.current?.value || "#5865F2",
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : {},
      };

      await updateUserProfile(user.uid, updates);
      setStatus({ variant: "success", message: "Profile updated successfully." });
      // Reload profile doc
      const doc = await getUserByUID(user.uid);
      setProfileDoc(doc);
      router.refresh();
    } catch {
      setStatus({
        variant: "danger",
        message: "Failed to update profile. Please try again.",
      });
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
            {/* Banner Upload Card */}
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="h6 mb-3">Profile Banner</Card.Title>
                {profileDoc?.bannerURL && (
                  <div className="mb-3" style={{ height: 120, overflow: "hidden", borderRadius: 8 }}>
                    <Image
                      src={profileDoc.bannerURL}
                      alt="Current banner"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <Form.Group controlId="bannerUpload">
                  <Form.Label>Upload Banner (1500x500px recommended)</Form.Label>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      ref={bannerFileRef}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleBannerUpload}
                      disabled={pending === "banner"}
                    >
                      {pending === "banner" ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Upload Banner"
                      )}
                    </Button>
                  </Stack>
                  <Form.Text className="text-muted">
                    JPG, PNG, or WebP (5&nbsp;MB max). Will use gradient fallback if not set.
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Profile Details Card */}
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="h6 mb-3">Profile Details</Card.Title>
                <Form>
                  <Form.Group className="mb-3" controlId="bio">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      ref={bioRef}
                      defaultValue={profileDoc?.bio || ""}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="pronouns">
                    <Form.Label>Pronouns</Form.Label>
                    <Form.Control
                      type="text"
                      ref={pronounsRef}
                      defaultValue={profileDoc?.pronouns || ""}
                      placeholder="e.g., he/him, she/her, they/them"
                      maxLength={50}
                    />
                  </Form.Group>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="location">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                          type="text"
                          ref={locationRef}
                          defaultValue={profileDoc?.location || ""}
                          placeholder="e.g., San Francisco, CA"
                          maxLength={100}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="timezone">
                        <Form.Label>Timezone</Form.Label>
                        <Form.Control
                          type="text"
                          ref={timezoneRef}
                          defaultValue={profileDoc?.timezone || ""}
                          placeholder="e.g., America/Los_Angeles"
                          maxLength={100}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="accentColor">
                    <Form.Label>Accent Color</Form.Label>
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control
                        type="color"
                        ref={accentColorRef}
                        defaultValue={profileDoc?.accentColor || "#5865F2"}
                        style={{ width: 60, height: 38 }}
                      />
                      <Form.Text className="text-muted">
                        Choose a color for your profile borders and badges
                      </Form.Text>
                    </div>
                  </Form.Group>

                  <Card.Subtitle className="h6 mb-3 mt-4">Social Links</Card.Subtitle>

                  <Form.Group className="mb-3" controlId="discord">
                    <Form.Label>Discord</Form.Label>
                    <Form.Control
                      type="url"
                      ref={discordRef}
                      defaultValue={profileDoc?.socialLinks?.discord || ""}
                      placeholder="https://discord.gg/..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="twitch">
                    <Form.Label>Twitch</Form.Label>
                    <Form.Control
                      type="url"
                      ref={twitchRef}
                      defaultValue={profileDoc?.socialLinks?.twitch || ""}
                      placeholder="https://twitch.tv/..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="twitter">
                    <Form.Label>Twitter/X</Form.Label>
                    <Form.Control
                      type="url"
                      ref={twitterRef}
                      defaultValue={profileDoc?.socialLinks?.twitter || ""}
                      placeholder="https://twitter.com/..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="youtube">
                    <Form.Label>YouTube</Form.Label>
                    <Form.Control
                      type="url"
                      ref={youtubeRef}
                      defaultValue={profileDoc?.socialLinks?.youtube || ""}
                      placeholder="https://youtube.com/@..."
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleProfileUpdate}
                      disabled={pending === "profile"}
                    >
                      {pending === "profile" ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Save Profile Changes"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

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
