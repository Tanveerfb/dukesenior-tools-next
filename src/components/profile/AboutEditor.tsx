"use client";
import React from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function AboutEditor({
  uid,
  bio,
}: {
  uid: string;
  bio?: string;
}) {
  const { user } = useAuth();
  const isOwner = !!(user?.uid && uid && user.uid === uid);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(bio || "");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    if (!isOwner) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", uid);
      await setDoc(ref, { bio: draft, updatedAt: Date.now() }, { merge: true });
      setEditing(false);
    } catch (e) {
      console.error("AboutEditor save", e);
    }
    setSaving(false);
  }

  if (!isOwner) return null;

  return (
    <div>
      {editing ? (
        <>
          <textarea
            className={cn(
              "w-full rounded-lg border border-border dark:border-border-dark",
              "bg-card dark:bg-card-dark text-foreground dark:text-foreground-dark",
              "p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            )}
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-1 text-sm rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
              onClick={save}
              disabled={saving}
            >
              Save
            </button>
            <button
              className="px-3 py-1 text-sm rounded-lg border border-border dark:border-border-dark text-foreground-muted dark:text-foreground-dark-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              onClick={() => {
                setEditing(false);
                setDraft(bio || "");
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="text-right">
          <button
            className="text-sm text-primary-500 hover:text-primary-600 underline transition-colors"
            onClick={() => setEditing(true)}
          >
            Edit about
          </button>
        </div>
      )}
    </div>
  );
}