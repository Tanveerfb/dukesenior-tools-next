import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  where,
  increment,
  updateDoc,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { getAllSamplePosts } from "@/lib/content/samplePosts";
import { CMSPost, NewPostInput, UpdatePostInput } from "@/types/cms";
import {
  awardXP,
  incrementStat,
  getUserGamification,
} from "@/lib/services/gamification";
import { XP_REWARDS } from "@/types/gamification";
import { POSTS_COL } from "./constants";

export function slugify(t: string) {
  return t
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function createPost(
  uid: string,
  authorName: string,
  input: NewPostInput,
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const ref = doc(db, POSTS_COL, id);
  const status = input.status || "published";
  const post: CMSPost = {
    id,
    title: input.title,
    slug: slugify(input.title),
    content: input.content,
    createdAt: now,
    updatedAt: now,
    authorUID: uid,
    authorName,
    bannerUrl: input.bannerUrl,
    tags: input.tags || [],
    pinned: !!input.pinned,
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 0,
    status,
    scheduledFor: input.scheduledFor,
    views: 0,
  };
  await setDoc(ref, post);

  if (status === "published") {
    try {
      const gamification = await getUserGamification(uid);
      const isFirstPost =
        !gamification || gamification.stats.postsCreated === 0;
      await awardXP(uid, XP_REWARDS.POST_CREATED, "Created a post", "post", {
        postId: id,
      });
      if (isFirstPost) {
        await awardXP(uid, XP_REWARDS.FIRST_POST, "Created first post", "post", {
          postId: id,
          milestone: true,
        });
      }
      await incrementStat(uid, "postsCreated", 1);
    } catch (err) {
      console.error("Error awarding XP for post creation:", err);
    }
  }

  return id;
}

export async function updatePost(input: UpdatePostInput) {
  const ref = doc(db, POSTS_COL, input.id);
  const updates: Record<string, any> = { updatedAt: Date.now() };
  Object.entries(input).forEach(([key, value]) => {
    if (key !== "id" && value !== undefined) {
      updates[key] = value;
    }
  });
  await updateDoc(ref, updates);
}

export async function setPostPinned(id: string, pinned: boolean) {
  await updateDoc(doc(db, POSTS_COL, id), { pinned, updatedAt: Date.now() });
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, POSTS_COL, id));
}

export async function listPosts(limitCount = 25, includeUnpublished = false) {
  let q;
  if (includeUnpublished) {
    q = query(
      collection(db, POSTS_COL),
      orderBy("pinned", "desc"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
  } else {
    q = query(
      collection(db, POSTS_COL),
      where("status", "==", "published"),
      orderBy("pinned", "desc"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
  }
  const snap = await getDocs(q);
  const list: CMSPost[] = [];
  snap.forEach((d) => list.push(d.data() as CMSPost));
  return list;
}

export async function getPost(id: string) {
  const snap = await getDoc(doc(db, POSTS_COL, id));
  return snap.data() as CMSPost | undefined;
}

export async function getPostBySlug(slug: string) {
  const q = query(
    collection(db, POSTS_COL),
    where("slug", "==", slug),
    limit(1),
  );
  const snap = await getDocs(q);
  let post: CMSPost | undefined;
  snap.forEach((d) => (post = d.data() as CMSPost));
  return post;
}

export function listenPost(
  id: string,
  cb: (post: CMSPost | undefined) => void,
) {
  return onSnapshot(doc(db, POSTS_COL, id), (snap) =>
    cb(snap.data() as CMSPost | undefined),
  );
}

export async function seedSamplePostsIfEmpty() {
  const existing = await listPosts(1);
  if (existing.length) return false;
  const samples = getAllSamplePosts();
  for (const s of samples) {
    const ref = doc(db, POSTS_COL, s.id);
    await setDoc(ref, s, { merge: false });
  }
  return true;
}

export async function seedSingleSamplePost(slug: string) {
  const samples = getAllSamplePosts();
  const target = samples.find((p) => p.slug === slug);
  if (!target) return false;
  const ref = doc(db, POSTS_COL, target.id);
  const snap = await getDoc(ref);
  if (snap.exists()) return false;
  await setDoc(ref, target, { merge: false });
  return true;
}

export async function listScheduledPosts() {
  const now = Date.now();
  const q = query(
    collection(db, POSTS_COL),
    where("status", "==", "scheduled"),
    where("scheduledFor", "<=", now),
  );
  const snap = await getDocs(q);
  const list: CMSPost[] = [];
  snap.forEach((d) => list.push(d.data() as CMSPost));
  return list;
}

export async function publishScheduledPost(id: string) {
  await updateDoc(doc(db, POSTS_COL, id), {
    status: "published",
    updatedAt: Date.now(),
  });
}

export async function incrementPostViews(id: string) {
  await updateDoc(doc(db, POSTS_COL, id), { views: increment(1) });
}

export async function getAnalyticsSummary(): Promise<any> {
  const allPosts = await listPosts(1000, true);
  const publishedPosts = allPosts.filter((p) => p.status === "published");

  const totalViews = publishedPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalComments = publishedPosts.reduce(
    (sum, p) => sum + (p.commentCount || 0),
    0,
  );

  const topPosts = [...publishedPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map((p) => ({
      postId: p.id,
      title: p.title,
      views: p.views || 0,
      likes: p.likeCount,
      dislikes: p.dislikeCount,
      comments: p.commentCount,
      createdAt: p.createdAt,
    }));

  const tagMap = new Map<string, { postCount: number; totalViews: number }>();
  publishedPosts.forEach((p) => {
    (p.tags || []).forEach((tag) => {
      const existing = tagMap.get(tag) || { postCount: 0, totalViews: 0 };
      tagMap.set(tag, {
        postCount: existing.postCount + 1,
        totalViews: existing.totalViews + (p.views || 0),
      });
    });
  });

  const tagUsage = Array.from(tagMap.entries())
    .map(([tag, data]) => ({ tag, ...data }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10);

  const viewsByDay: { date: string; views: number }[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  for (let i = 29; i >= 0; i--) {
    const dayStart = now - i * dayMs;
    const dayEnd = dayStart + dayMs;
    const date = new Date(dayStart).toISOString().split("T")[0];
    const dayPosts = publishedPosts.filter(
      (p) => p.createdAt >= dayStart && p.createdAt < dayEnd,
    );
    const views = dayPosts.reduce((sum, p) => sum + (p.views || 0), 0);
    viewsByDay.push({ date, views });
  }

  return {
    totalPosts: publishedPosts.length,
    totalViews,
    totalComments,
    topPosts,
    tagUsage,
    viewsByDay,
  };
}

export async function listPendingPosts(): Promise<CMSPost[]> {
  const q = query(
    collection(db, POSTS_COL),
    where("reviewStatus", "==", "pending"),
    orderBy("submittedAt", "desc"),
  );
  const snap = await getDocs(q);
  const posts: CMSPost[] = [];
  snap.forEach((d) => posts.push(d.data() as CMSPost));
  return posts;
}

export async function listUserPosts(
  uid: string,
  status?: "draft" | "published" | "scheduled",
  reviewStatus?: "pending" | "approved" | "rejected",
): Promise<CMSPost[]> {
  let q = query(
    collection(db, POSTS_COL),
    where("authorUID", "==", uid),
    orderBy("updatedAt", "desc"),
  );
  if (status) q = query(q, where("status", "==", status));
  if (reviewStatus) q = query(q, where("reviewStatus", "==", reviewStatus));
  const snap = await getDocs(q);
  const posts: CMSPost[] = [];
  snap.forEach((d) => posts.push(d.data() as CMSPost));
  return posts;
}
