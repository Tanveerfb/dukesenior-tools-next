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
    // try treat the param as a UID
    user = await getUserByUID(username);
  }
  if (!user) return notFound();

  return (
    <div className="container py-4">
      <ProfileHeader
        uid={user.uid}
        username={user.username}
        displayName={user.displayName}
        photoURL={user.photoURL}
        bio={typeof user.bio === "string" ? user.bio : user.bio || ""}
        createdAt={user.createdAt}
        // additional fields (used by header)
        lastSeen={user.lastSeen}
        signInCount={user.signInCount}
      />

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-body">
              <h5>Recent Activity</h5>
              <p className="text-muted">No public activity to show.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5>Posts</h5>
              <p className="text-muted">User hasn't posted yet.</p>
            </div>
          </div>
        </div>

        <aside className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h6>About</h6>
              <p className="text-muted">{user.bio || "No bio provided."}</p>
              {/* owner-only inline editor placed here */}
              {/* AboutEditor is a client component */}
              <div className="mt-2">
                <AboutEditor
                  uid={user.uid}
                  bio={typeof user.bio === "string" ? user.bio : ""}
                />
              </div>
            </div>
          </div>

          <UIDCopyCard uid={user.uid} />

          <div className="card">
            <div className="card-body">
              <h6>Stats</h6>
              <ul className="list-unstyled small text-muted mb-0">
                <li>
                  Joined:{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
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
