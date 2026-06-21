"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserByUID,
  updateUserProfile,
  type UserDoc,
} from "@/lib/services/users";

type Feedback = {
  variant: "success" | "danger" | "info" | "warning";
  message: string;
};

type PendingAction =
  | "display"
  | "password"
  | "avatar"
  | "banner"
  | "profile"
  | "logout"
  | null;

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
        // we no longer redirect away from the edit page. '/profile' is
        // deliberately the edit route; the earlier behavior bounced users
        // immediately back to the public slug view which made the "Edit
        // Profile" button useless.
        // if we ever want to send people to the public page automatically,
        // we can handle that with a separate button or query parameter.
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
      if (discordRef.current?.value)
        socialLinks.discord = discordRef.current.value;
      if (twitchRef.current?.value)
        socialLinks.twitch = twitchRef.current.value;
      if (twitterRef.current?.value)
        socialLinks.twitter = twitterRef.current.value;
      if (youtubeRef.current?.value)
        socialLinks.youtube = youtubeRef.current.value;

      const updates: Partial<UserDoc> = {
        bio: bioRef.current?.value || "",
        pronouns: pronounsRef.current?.value || "",
        location: locationRef.current?.value || "",
        timezone: timezoneRef.current?.value || "",
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : {},
      };

      await updateUserProfile(user.uid, updates);
      setStatus({
        variant: "success",
        message: "Profile updated successfully.",
      });
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
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <svg
          className="animate-spin h-6 w-6 mx-auto text-primary-500"
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
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm text-center">
          <div className="p-6">
            <h5 className="text-lg font-semibold mb-2">
              Sign in to manage your profile
            </h5>
            <p className="text-foreground-secondary mb-4">
              Access profile settings, update your details, and manage security
              once you are logged in.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
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
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-col gap-3 mb-3">
        {status && (
          <div
            className={cn(
              "rounded-lg border px-4 py-3",
              status.variant === "success" &&
                "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300",
              status.variant === "danger" &&
                "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300",
              status.variant === "warning" &&
                "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
              status.variant === "info" &&
                "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
            )}
          >
            <div className="flex justify-between items-start">
              <span>{status.message}</span>
              <button
                onClick={() => setStatus(null)}
                className="ml-2 text-current opacity-70 hover:opacity-100"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm h-full">
            <div className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile picture"
                      className="rounded-full object-cover"
                      width={88}
                      height={88}
                    />
                  ) : (
                    <div
                      className="bg-gray-200 dark:bg-gray-700 text-foreground-secondary flex items-center justify-center rounded-full"
                      style={{ width: 88, height: 88, fontSize: "1.75rem" }}
                    >
                      {initial}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold mb-1">
                      {displayName || "Your profile"}
                    </h2>
                    <div className="text-foreground-secondary text-sm">
                      {emailAddress}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full text-xs font-medium px-2.5 py-0.5",
                          user.emailVerified
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                        )}
                      >
                        {user.emailVerified
                          ? "Email verified"
                          : "Email not verified"}
                      </span>
                    </div>
                  </div>
                </div>

                <form>
                  <div className="mb-3">
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Display name
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        id="displayName"
                        ref={displayNameRef}
                        placeholder={displayName || "Add a name"}
                        maxLength={64}
                        aria-label="Display name"
                        className="flex-1 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleDisplayNameUpdate}
                        disabled={pending === "display"}
                        className="rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {pending === "display" ? (
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
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      This name appears across tools and community features.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="avatarUpload"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Profile picture
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="file"
                        id="avatarUpload"
                        accept="image/*"
                        ref={fileRef}
                        className="flex-1 text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={pending === "avatar"}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-foreground px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {pending === "avatar" ? (
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
                        ) : (
                          "Upload"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      Use a square JPG or PNG (2&nbsp;MB max recommended).
                    </p>
                  </div>
                </form>

                <div className="pt-2 border-t border-border dark:border-border-dark text-sm text-foreground-secondary">
                  {joinedAt && <div>Joined {joinedAt}</div>}
                  {lastSeen && <div>Last seen {lastSeen}</div>}
                  {!profileDoc?.username && (
                    <div>
                      Public username not set. Claim one from your public
                      profile page soon.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex flex-col gap-3">
            {/* Banner Upload Card */}
            <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
              <div className="p-4">
                <h6 className="text-sm font-semibold mb-3">Profile Banner</h6>
                {profileDoc?.bannerURL && (
                  <div
                    className="mb-3 overflow-hidden rounded-lg"
                    style={{ height: 120 }}
                  >
                    <img
                      src={profileDoc.bannerURL}
                      alt="Current banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="bannerUpload"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Upload Banner (1500x500px recommended)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      id="bannerUpload"
                      accept="image/*"
                      ref={bannerFileRef}
                      className="flex-1 text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleBannerUpload}
                      disabled={pending === "banner"}
                      className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-foreground px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {pending === "banner" ? (
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
                      ) : (
                        "Upload Banner"
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-foreground-secondary mt-1">
                    JPG, PNG, or WebP (5&nbsp;MB max). Will use gradient
                    fallback if not set.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Details Card */}
            <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
              <div className="p-4">
                <h6 className="text-sm font-semibold mb-3">Profile Details</h6>
                <form>
                  <div className="mb-3">
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      ref={bioRef}
                      defaultValue={profileDoc?.bio || ""}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                      className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="pronouns"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Pronouns
                    </label>
                    <input
                      type="text"
                      id="pronouns"
                      ref={pronounsRef}
                      defaultValue={profileDoc?.pronouns || ""}
                      placeholder="e.g., he/him, she/her, they/them"
                      maxLength={50}
                      className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        ref={locationRef}
                        defaultValue={profileDoc?.location || ""}
                        placeholder="e.g., San Francisco, CA"
                        maxLength={100}
                        className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="timezone"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Timezone
                      </label>
                      <input
                        type="text"
                        id="timezone"
                        ref={timezoneRef}
                        defaultValue={profileDoc?.timezone || ""}
                        placeholder="e.g., America/Los_Angeles"
                        maxLength={100}
                        className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <h6 className="text-sm font-semibold mb-3 mt-4">
                    Social Links
                  </h6>

                  <div className="mb-3">
                    <label
                      htmlFor="discord"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Discord
                    </label>
                    <input
                      type="url"
                      id="discord"
                      ref={discordRef}
                      defaultValue={profileDoc?.socialLinks?.discord || ""}
                      placeholder="https://discord.gg/..."
                      className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="twitch"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Twitch
                    </label>
                    <input
                      type="url"
                      id="twitch"
                      ref={twitchRef}
                      defaultValue={profileDoc?.socialLinks?.twitch || ""}
                      placeholder="https://twitch.tv/..."
                      className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="twitter"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Twitter/X
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      ref={twitterRef}
                      defaultValue={profileDoc?.socialLinks?.twitter || ""}
                      placeholder="https://twitter.com/..."
                      className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="youtube"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      YouTube
                    </label>
                    <input
                      type="url"
                      id="youtube"
                      ref={youtubeRef}
                      defaultValue={profileDoc?.socialLinks?.youtube || ""}
                      placeholder="https://youtube.com/@..."
                      className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleProfileUpdate}
                      disabled={pending === "profile"}
                      className="w-full rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 text-base font-medium transition-colors disabled:opacity-50"
                    >
                      {pending === "profile" ? (
                        <svg
                          className="animate-spin h-5 w-5 mx-auto"
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
                      ) : (
                        "Save Profile Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
              <div className="p-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h6 className="text-sm font-semibold mb-1">
                      Account security
                    </h6>
                    <p className="text-foreground-secondary text-sm mb-0">
                      Send a password reset link to your email address.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={pending === "password"}
                    className="rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {pending === "password" ? (
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
                    ) : (
                      "Send reset email"
                    )}
                  </button>
                </div>
                {passwordStatus && (
                  <div
                    className={cn(
                      "mt-3 rounded-lg border px-4 py-3",
                      passwordStatus.variant === "success" &&
                        "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300",
                      passwordStatus.variant === "danger" &&
                        "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300",
                      passwordStatus.variant === "warning" &&
                        "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span>{passwordStatus.message}</span>
                      <button
                        onClick={() => setPasswordStatus(null)}
                        className="ml-2 text-current opacity-70 hover:opacity-100"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
              <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h6 className="text-sm font-semibold mb-1">Sign out</h6>
                  <p className="text-foreground-secondary text-sm mb-0">
                    Log out of The Lair of Evil on this device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={pending === "logout"}
                  className="rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {pending === "logout" ? (
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
                  ) : (
                    "Log out"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
