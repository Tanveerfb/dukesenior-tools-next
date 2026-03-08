import React from "react";
import { notFound } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutEditor from "@/components/profile/AboutEditor";
import UIDCopyCard from "@/components/profile/UIDCopyCard";
import { getUserByUsername, getUserByUID } from "@/lib/services/users";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = (await params) as { username: string };
  let user = await getUserByUsername(username);
  if (!user) {
    user = await getUserByUID(username);
  }
  if (!user) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <ProfileHeader
        uid={user.uid}
        username={user.username}
        displayName={user.displayName}
        photoURL={user.photoURL}
        bio={typeof user.bio === "string" ? user.bio : user.bio || ""}
        createdAt={user.createdAt}
        lastSeen={user.lastSeen}
        signInCount={user.signInCount}
        bannerURL={user.bannerURL}
        pronouns={user.pronouns}
        location={user.location}
        timezone={user.timezone}
        socialLinks={user.socialLinks}
        roles={user.roles}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow">
            <div className="p-5">
              <h5 className="text-lg font-semibold text-foreground dark:text-foreground-dark">
                Recent Activity
              </h5>
              <p className="text-foreground-muted dark:text-foreground-dark-muted">
                No public activity to show.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow">
            <div className="p-5">
              <h5 className="text-lg font-semibold text-foreground dark:text-foreground-dark">
                Posts
              </h5>
              <p className="text-foreground-muted dark:text-foreground-dark-muted">
                User hasn&apos;t posted yet.
              </p>
            </div>
          </div>
        </div>

        <aside className="md:col-span-4 space-y-4">
          <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow">
            <div className="p-5">
              <h6 className="text-base font-semibold text-foreground dark:text-foreground-dark">
                About
              </h6>
              <p className="text-foreground-muted dark:text-foreground-dark-muted">
                {user.bio || "No bio provided."}
              </p>

              {(user.location || user.timezone) && (
                <div className="text-sm text-foreground-muted dark:text-foreground-dark-muted mt-3">
                  {user.location && <div>📍 {user.location}</div>}
                  {user.timezone && <div>🕐 {user.timezone}</div>}
                </div>
              )}

              {user.socialLinks &&
                Object.values(user.socialLinks).some((v) => v) && (
                  <div className="mt-3">
                    <h6 className="text-xs uppercase text-foreground-muted dark:text-foreground-dark-muted mb-2">
                      Social Links
                    </h6>
                    <div className="flex gap-2">
                      {user.socialLinks.discord && (
                        <a
                          href={user.socialLinks.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline text-primary-500 hover:text-primary-600"
                          title="Discord"
                        >
                          Discord
                        </a>
                      )}
                      {user.socialLinks.twitch && (
                        <a
                          href={user.socialLinks.twitch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline text-primary-500 hover:text-primary-600"
                          title="Twitch"
                        >
                          Twitch
                        </a>
                      )}
                      {user.socialLinks.twitter && (
                        <a
                          href={user.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline text-primary-500 hover:text-primary-600"
                          title="Twitter"
                        >
                          Twitter
                        </a>
                      )}
                      {user.socialLinks.youtube && (
                        <a
                          href={user.socialLinks.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline text-primary-500 hover:text-primary-600"
                          title="YouTube"
                        >
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}

              <div className="mt-2">
                <AboutEditor
                  uid={user.uid}
                  bio={typeof user.bio === "string" ? user.bio : ""}
                />
              </div>
            </div>
          </div>

          <UIDCopyCard uid={user.uid} />

          <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow">
            <div className="p-5">
              <h6 className="text-base font-semibold text-foreground dark:text-foreground-dark">
                Stats
              </h6>
              <ul className="list-none text-sm text-foreground-muted dark:text-foreground-dark-muted space-y-1 mb-0 p-0">
                <li>
                  Joined:{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "\u2014"}
                </li>
                <li>Posts: 0</li>
                <li>Followers: 0</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
