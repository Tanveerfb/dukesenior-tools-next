/**
 * Bookmark/Favorites Service
 * Handles saving and managing bookmarked posts
 */

import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { Bookmark } from "@/types/bookmarks";
import type { CMSPost } from "@/types/cms";
import { getPost } from "./cms";

/**
 * Add a bookmark for a user
 */
export async function addBookmark(
  uid: string,
  postId: string,
  folder: string = "read-later",
  notes?: string
): Promise<void> {
  const bookmarkRef = doc(db, `userBookmarks/${uid}/posts`, postId);
  const bookmark: Bookmark = {
    id: postId,
    uid,
    postId,
    savedAt: Date.now(),
    folder,
    notes,
  };
  await setDoc(bookmarkRef, bookmark);
}

/**
 * Remove a bookmark for a user
 */
export async function removeBookmark(
  uid: string,
  postId: string
): Promise<void> {
  const bookmarkRef = doc(db, `userBookmarks/${uid}/posts`, postId);
  await deleteDoc(bookmarkRef);
}

/**
 * Check if a post is bookmarked by a user
 */
export async function isBookmarked(
  uid: string,
  postId: string
): Promise<boolean> {
  const bookmarkRef = doc(db, `userBookmarks/${uid}/posts`, postId);
  const snap = await getDoc(bookmarkRef);
  return snap.exists();
}

/**
 * Get all bookmarks for a user (optionally filtered by folder)
 */
export async function getUserBookmarks(
  uid: string,
  folder?: string
): Promise<Bookmark[]> {
  const bookmarksCol = collection(db, `userBookmarks/${uid}/posts`);
  let q = query(bookmarksCol, orderBy("savedAt", "desc"));

  if (folder) {
    q = query(q, where("folder", "==", folder));
  }

  const snap = await getDocs(q);
  const bookmarks: Bookmark[] = [];
  snap.forEach((doc) => bookmarks.push(doc.data() as Bookmark));
  return bookmarks;
}

/**
 * Get bookmarks with post data
 */
export async function getUserBookmarksWithPosts(
  uid: string,
  folder?: string
): Promise<Array<{ bookmark: Bookmark; post: CMSPost | undefined }>> {
  const bookmarks = await getUserBookmarks(uid, folder);
  const results = await Promise.all(
    bookmarks.map(async (bookmark) => {
      const post = await getPost(bookmark.postId);
      return { bookmark, post };
    })
  );
  // Filter out bookmarks where post no longer exists
  return results.filter((r) => r.post !== undefined);
}

/**
 * Update bookmark folder
 */
export async function updateBookmarkFolder(
  uid: string,
  postId: string,
  folder: string
): Promise<void> {
  const bookmarkRef = doc(db, `userBookmarks/${uid}/posts`, postId);
  const snap = await getDoc(bookmarkRef);
  if (!snap.exists()) return;

  const bookmark = snap.data() as Bookmark;
  await setDoc(bookmarkRef, { ...bookmark, folder }, { merge: true });
}

/**
 * Update bookmark notes
 */
export async function updateBookmarkNotes(
  uid: string,
  postId: string,
  notes: string
): Promise<void> {
  const bookmarkRef = doc(db, `userBookmarks/${uid}/posts`, postId);
  const snap = await getDoc(bookmarkRef);
  if (!snap.exists()) return;

  const bookmark = snap.data() as Bookmark;
  await setDoc(bookmarkRef, { ...bookmark, notes }, { merge: true });
}

/**
 * Get list of folders for a user
 */
export async function getUserBookmarkFolders(
  uid: string
): Promise<{ name: string; count: number }[]> {
  const bookmarks = await getUserBookmarks(uid);
  const folderMap = new Map<string, number>();

  bookmarks.forEach((bookmark) => {
    const folder = bookmark.folder || "read-later";
    folderMap.set(folder, (folderMap.get(folder) || 0) + 1);
  });

  return Array.from(folderMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      // Sort: read-later first, favorites second, then alphabetically
      if (a.name === "read-later") return -1;
      if (b.name === "read-later") return 1;
      if (a.name === "favorites") return -1;
      if (b.name === "favorites") return 1;
      return a.name.localeCompare(b.name);
    });
}
