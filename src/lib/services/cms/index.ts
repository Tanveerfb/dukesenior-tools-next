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
  runTransaction,
} from "firebase/firestore";
import { getAllSamplePosts } from "@/lib/content/samplePosts";
import {
  CMSPost,
  NewPostInput,
  UpdatePostInput,
  CMSComment,
  NewCommentInput,
  ReactionType,
} from "@/types/cms";
import {
  awardXP,
  incrementStat,
  getUserGamification,
} from "@/lib/services/gamification";
import { XP_REWARDS } from "@/types/gamification";
import { createNotification } from "@/lib/services/notifications";

const POSTS_COL = "cms_posts_v1";
const COMMENTS_COL = "cms_comments_v1";
const POST_REACTIONS_COL = "cms_post_reactions_v1";
const COMMENT_REACTIONS_COL = "cms_comment_reactions_v1";

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

  // Award XP for creating a post (only for published posts)
  if (status === "published") {
    try {
      const gamification = await getUserGamification(uid);
      const isFirstPost =
        !gamification || gamification.stats.postsCreated === 0;

      // Award base XP
      await awardXP(uid, XP_REWARDS.POST_CREATED, "Created a post", "post", {
        postId: id,
      });

      // Award first post bonus
      if (isFirstPost) {
        await awardXP(
          uid,
          XP_REWARDS.FIRST_POST,
          "Created first post",
          "post",
          { postId: id, milestone: true },
        );
      }

      // Increment stat
      await incrementStat(uid, "postsCreated", 1);
    } catch (err) {
      console.error("Error awarding XP for post creation:", err);
    }
  }

  return id;
}

export async function updatePost(input: UpdatePostInput) {
  const ref = doc(db, POSTS_COL, input.id);
  // Filter out undefined values to avoid Firestore errors
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

// Comments
export async function addComment(
  uid: string,
  authorName: string,
  input: NewCommentInput,
) {
  const id = crypto.randomUUID();
  const now = Date.now();
  let path = id;
  if (input.parentId) {
    const parent = await getDoc(doc(db, COMMENTS_COL, input.parentId));
    const parentData = parent.data() as CMSComment | undefined;
    path = parentData ? parentData.path + "/" + id : id;
  }
  // allow optional mentions array on the input (list of usernames)
  const comment: CMSComment = {
    id,
    postId: input.postId,
    parentId: input.parentId ?? null,
    authorUID: uid,
    authorName,
    content: input.content,
    createdAt: now,
    updatedAt: now,
    likeCount: 0,
    dislikeCount: 0,
    path,
    mentions: input.mentions || [],
  } as any;
  await setDoc(doc(db, COMMENTS_COL, id), comment);
  await updateDoc(doc(db, POSTS_COL, input.postId), {
    commentCount: increment(1),
  });

  // Award XP for commenting
  try {
    await awardXP(
      uid,
      XP_REWARDS.COMMENT_POSTED,
      "Posted a comment",
      "comment",
      {
        commentId: id,
        postId: input.postId,
      },
    );
    await incrementStat(uid, "commentsPosted", 1);
  } catch (err) {
    console.error("Error awarding XP for comment:", err);
  }

  return id;
}

export async function listTopLevelComments(postId: string) {
  const q = query(
    collection(db, COMMENTS_COL),
    where("postId", "==", postId),
    where("parentId", "==", null),
  );
  const snap = await getDocs(q);
  const list: CMSComment[] = [];
  snap.forEach((d) => list.push(d.data() as CMSComment));
  return list;
}

export async function listReplies(parentId: string) {
  const parentSnap = await getDoc(doc(db, COMMENTS_COL, parentId));
  const parent = parentSnap.data() as CMSComment | undefined;
  if (!parent) return [];
  const q = query(
    collection(db, COMMENTS_COL),
    where("path", ">=", parent.path + "/"),
    where("path", "<=", parent.path + "\uf8ff"),
  );
  const snap = await getDocs(q);
  const list: CMSComment[] = [];
  snap.forEach((d) => {
    const c = d.data() as CMSComment;
    if (c.parentId === parentId) list.push(c);
  });
  return list;
}

export async function listRecentComments(limitCount = 50) {
  const q = query(
    collection(db, COMMENTS_COL),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  const list: CMSComment[] = [];
  snap.forEach((d) => list.push(d.data() as CMSComment));
  return list;
}

export async function deleteComment(id: string) {
  const cSnap = await getDoc(doc(db, COMMENTS_COL, id));
  const data = cSnap.data() as CMSComment | undefined;
  if (!data) return;
  await deleteDoc(doc(db, COMMENTS_COL, id));
  // decrement post comment count (not counting nested separately for simplicity)
  await updateDoc(doc(db, POSTS_COL, data.postId), {
    commentCount: increment(-1),
  });
}

export async function reactToComment(
  id: string,
  type: "like" | "dislike",
  delta = 1,
) {
  const field = type === "like" ? "likeCount" : "dislikeCount";
  await updateDoc(doc(db, COMMENTS_COL, id), { [field]: increment(delta) });
}

export async function reactToPost(
  id: string,
  type: "like" | "dislike",
  delta = 1,
) {
  const field = type === "like" ? "likeCount" : "dislikeCount";
  await updateDoc(doc(db, POSTS_COL, id), { [field]: increment(delta) });
}

// Realtime listeners
export function listenPost(
  id: string,
  cb: (post: CMSPost | undefined) => void,
) {
  return onSnapshot(doc(db, POSTS_COL, id), (snap) =>
    cb(snap.data() as CMSPost | undefined),
  );
}

export function listenComments(
  postId: string,
  cb: (comments: CMSComment[]) => void,
) {
  const q = query(
    collection(db, COMMENTS_COL),
    where("postId", "==", postId),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const list: CMSComment[] = [];
    snap.forEach((d) => list.push(d.data() as CMSComment));
    cb(list);
  });
}

// User-scoped reaction with transaction to prevent double count (client-side best effort)
export async function reactToPostForUser(
  postId: string,
  uid: string,
  reaction: "like" | "dislike",
) {
  const reactionId = postId + "_" + uid;
  const reactionRef = doc(db, POST_REACTIONS_COL, reactionId);
  const postRef = doc(db, POSTS_COL, postId);
  await runTransaction(db, async (tx) => {
    const reactionSnap = await tx.get(reactionRef);
    const prev = reactionSnap.exists()
      ? (reactionSnap.data() as any).reaction
      : null;
    if (prev === reaction) return; // no change
    // adjust counts
    const incLike = (reaction === "like" ? 1 : 0) - (prev === "like" ? 1 : 0);
    const incDislike =
      (reaction === "dislike" ? 1 : 0) - (prev === "dislike" ? 1 : 0);
    if (!reactionSnap.exists())
      tx.set(reactionRef, {
        postId,
        uid,
        reaction,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    else tx.update(reactionRef, { reaction, updatedAt: Date.now() });
    tx.update(postRef, {
      likeCount: increment(incLike),
      dislikeCount: increment(incDislike),
    });
  });
}

export async function reactToCommentForUser(
  commentId: string,
  uid: string,
  reaction: "like" | "dislike",
) {
  const reactionId = commentId + "_" + uid;
  const reactionRef = doc(db, COMMENT_REACTIONS_COL, reactionId);
  const commentRef = doc(db, COMMENTS_COL, commentId);
  await runTransaction(db, async (tx) => {
    const reactionSnap = await tx.get(reactionRef);
    const prev = reactionSnap.exists()
      ? (reactionSnap.data() as any).reaction
      : null;
    if (prev === reaction) return;
    const incLike = (reaction === "like" ? 1 : 0) - (prev === "like" ? 1 : 0);
    const incDislike =
      (reaction === "dislike" ? 1 : 0) - (prev === "dislike" ? 1 : 0);
    if (!reactionSnap.exists())
      tx.set(reactionRef, {
        commentId,
        uid,
        reaction,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    else tx.update(reactionRef, { reaction, updatedAt: Date.now() });
    tx.update(commentRef, {
      likeCount: increment(incLike),
      dislikeCount: increment(incDislike),
    });
  });
}

export async function getUserPostReaction(postId: string, uid: string) {
  const snap = await getDoc(doc(db, POST_REACTIONS_COL, postId + "_" + uid));
  return snap.exists()
    ? ((snap.data() as any).reaction as "like" | "dislike")
    : undefined;
}
export async function getUserCommentReaction(commentId: string, uid: string) {
  const snap = await getDoc(
    doc(db, COMMENT_REACTIONS_COL, commentId + "_" + uid),
  );
  return snap.exists()
    ? ((snap.data() as any).reaction as "like" | "dislike")
    : undefined;
}

// Seed utilities
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
  if (snap.exists()) return false; // already seeded
  await setDoc(ref, target, { merge: false });
  return true;
}

function slugify(t: string) {
  return t
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

// Scheduled Post Publishing
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

// View Tracking
export async function incrementPostViews(id: string) {
  await updateDoc(doc(db, POSTS_COL, id), { views: increment(1) });
}

// Analytics
export async function getAnalyticsSummary(): Promise<any> {
  const allPosts = await listPosts(1000, true);
  const publishedPosts = allPosts.filter((p) => p.status === "published");

  const totalViews = publishedPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalComments = publishedPosts.reduce(
    (sum, p) => sum + (p.commentCount || 0),
    0,
  );

  // Top posts by views
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

  // Tag usage
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

  // Views by day (last 30 days)
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

// ============================================================================
/**
 * React to a post with one of 5 reaction types
 * Replaces old like/dislike system
 */
export async function reactToPostForUserV2(
  postId: string,
  uid: string,
  reactionType: ReactionType
): Promise<void> {
  const reactionId = postId + "_" + uid;
  const reactionRef = doc(db, POST_REACTIONS_COL, reactionId);
  const postRef = doc(db, POSTS_COL, postId);

  await runTransaction(db, async (tx) => {
    const reactionSnap = await tx.get(reactionRef);
    const postSnap = await tx.get(postRef);

    if (!postSnap.exists()) {
      throw new Error("Post not found");
    }

    const post = postSnap.data() as CMSPost;
    const prevReaction = reactionSnap.exists()
      ? (reactionSnap.data() as any).type
      : null;

    if (prevReaction === reactionType) return; // No change

    // Initialize reactionCounts if not present
    const reactionCounts = post.reactionCounts || {
      like: 0,
      love: 0,
      laugh: 0,
      insightful: 0,
      fire: 0,
    };

    // Decrement previous reaction count
    if (prevReaction) {
      reactionCounts[prevReaction as ReactionType] = Math.max(
        0,
        reactionCounts[prevReaction as ReactionType] - 1
      );
    }

    // Increment new reaction count
    reactionCounts[reactionType] = (reactionCounts[reactionType] || 0) + 1;

    // Update reaction document
    if (!reactionSnap.exists()) {
      tx.set(reactionRef, {
        postId,
        uid,
        type: reactionType,
        createdAt: Date.now(),
      });
    } else {
      tx.update(reactionRef, {
        type: reactionType,
        createdAt: Date.now(), // Update timestamp on reaction change
      });
    }

    // Update post with new counts
    tx.update(postRef, { reactionCounts });
  });

  // Award XP to post author for receiving reactions (non-blocking)
  try {
    const post = await getPost(postId);
    if (post && post.authorUID !== uid) {
      // Don't award XP for reacting to own posts
      let xpAmount = XP_REWARDS.REACTION_LIKE_RECEIVED; // Default
      if (reactionType === "love") xpAmount = XP_REWARDS.REACTION_LOVE_RECEIVED;
      if (reactionType === "insightful")
        xpAmount = XP_REWARDS.REACTION_INSIGHTFUL_RECEIVED;
      if (reactionType === "fire") xpAmount = XP_REWARDS.REACTION_FIRE_RECEIVED;
      if (reactionType === "laugh")
        xpAmount = XP_REWARDS.REACTION_LAUGH_RECEIVED;

      await awardXP(
        post.authorUID,
        xpAmount,
        `Received ${reactionType} reaction`,
        "post",
        { postId, reactionType }
      );
    }
  } catch (err) {
    console.error("Error awarding XP for reaction:", err);
  }
}

/**
 * Get user's reaction to a post (new system)
 */
export async function getUserPostReactionV2(
  postId: string,
  uid: string
): Promise<ReactionType | undefined> {
  const snap = await getDoc(doc(db, POST_REACTIONS_COL, postId + "_" + uid));
  return snap.exists() ? (snap.data() as any).type : undefined;
}

/**
 * Get list of users who reacted with a specific type
 */
export async function getPostReactors(
  postId: string,
  reactionType: ReactionType,
  limitCount: number = 5
): Promise<{ uid: string; createdAt: number }[]> {
  const q = query(
    collection(db, POST_REACTIONS_COL),
    where("postId", "==", postId),
    where("type", "==", reactionType),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  const reactors: { uid: string; createdAt: number }[] = [];
  snap.forEach((doc) => {
    const data = doc.data();
    reactors.push({ uid: data.uid, createdAt: data.createdAt });
  });
  return reactors;
}

// ============================================================================
// User-Generated Content with Approval System
// ============================================================================

/**
 * Create post with approval workflow
 * Non-admins create drafts or submit for review
 */
export async function createPostWithApproval(
  uid: string,
  authorName: string,
  input: NewPostInput,
  isAdmin: boolean
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const ref = doc(db, POSTS_COL, id);

  // Determine status based on user role
  let status = input.status || "draft";
  let needsApproval = false;
  let reviewStatus: "pending" | "approved" | "rejected" | undefined = undefined;
  let submittedAt: number | undefined = undefined;

  if (!isAdmin) {
    // Non-admins can only create drafts or submit for review
    if (status === "published" || status === "scheduled") {
      // User is trying to publish - submit for review instead
      status = "draft";
      needsApproval = true;
      reviewStatus = "pending";
      submittedAt = now;
    }
  }

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
    reactionCounts: {
      like: 0,
      love: 0,
      laugh: 0,
      insightful: 0,
      fire: 0,
    },
    needsApproval,
    reviewStatus,
    submittedAt,
  };

  await setDoc(ref, post);

  // Award XP based on status
  try {
    if (status === "draft") {
      if (reviewStatus === "pending") {
        // User submitted for review
        await awardXP(
          uid,
          XP_REWARDS.POST_SUBMITTED_FOR_REVIEW,
          "Submitted post for review",
          "post",
          { postId: id }
        );
        await incrementStat(uid, "postsDrafted", 1);
      } else {
        // Just saved as draft
        await awardXP(
          uid,
          XP_REWARDS.POST_DRAFT_SAVED,
          "Saved post draft",
          "post",
          { postId: id }
        );
        await incrementStat(uid, "postsDrafted", 1);
      }
    } else if (status === "published") {
      // Admin published directly
      const gamification = await getUserGamification(uid);
      const isFirstPost =
        !gamification || gamification.stats.postsCreated === 0;

      await awardXP(uid, XP_REWARDS.POST_CREATED, "Created a post", "post", {
        postId: id,
      });

      if (isFirstPost) {
        await awardXP(
          uid,
          XP_REWARDS.FIRST_POST,
          "Created first post",
          "post",
          { postId: id, milestone: true }
        );
      }

      await incrementStat(uid, "postsCreated", 1);
      await incrementStat(uid, "postsPublished", 1);
    }
  } catch (err) {
    console.error("Error awarding XP for post creation:", err);
  }

  return id;
}

/**
 * Submit draft post for review
 */
export async function submitPostForReview(postId: string, uid: string): Promise<void> {
  const postRef = doc(db, POSTS_COL, postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error("Post not found");
  }

  const post = postSnap.data() as CMSPost;

  // Verify ownership
  if (post.authorUID !== uid) {
    throw new Error("Not authorized to submit this post");
  }

  // Verify it's a draft
  if (post.status !== "draft") {
    throw new Error("Only draft posts can be submitted for review");
  }

  const now = Date.now();
  await updateDoc(postRef, {
    needsApproval: true,
    reviewStatus: "pending",
    submittedAt: now,
    updatedAt: now,
  });

  // Award XP for submission
  try {
    await awardXP(
      uid,
      XP_REWARDS.POST_SUBMITTED_FOR_REVIEW,
      "Submitted post for review",
      "post",
      { postId }
    );
  } catch (err) {
    console.error("Error awarding XP for submission:", err);
  }
}

/**
 * Admin approves a post
 */
export async function approvePost(
  postId: string,
  adminUID: string,
  adminName: string
): Promise<void> {
  const postRef = doc(db, POSTS_COL, postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error("Post not found");
  }

  const post = postSnap.data() as CMSPost;

  if (post.reviewStatus !== "pending") {
    throw new Error("Post is not pending review");
  }

  const now = Date.now();
  await updateDoc(postRef, {
    status: "published",
    reviewStatus: "approved",
    reviewedBy: adminUID,
    reviewedAt: now,
    updatedAt: now,
  });

  // Award XP and achievements to author
  try {
    const gamification = await getUserGamification(post.authorUID);

    // Award approval bonus XP
    await awardXP(
      post.authorUID,
      XP_REWARDS.POST_APPROVED_BONUS,
      "Post approved by admin",
      "post",
      { postId }
    );

    // Award POST_CREATED XP if not already given
    await awardXP(
      post.authorUID,
      XP_REWARDS.POST_CREATED,
      "Post published",
      "post",
      { postId }
    );

    // Increment published posts stat
    await incrementStat(post.authorUID, "postsPublished", 1);
    await incrementStat(post.authorUID, "postsCreated", 1);

    // Check for "Published Author" achievement (first published post)
    const isFirstPublished =
      !gamification || gamification.stats.postsPublished === 0;
    if (isFirstPublished) {
      // Award achievement manually via gamification service
      // This should trigger the achievement check system
    }
  } catch (err) {
    console.error("Error awarding XP for approval:", err);
  }

  // Send notification to author
  try {
    await createNotification({
      userId: post.authorUID,
      type: "post-approved",
      title: "Post Approved!",
      body: `Your post "${post.title}" has been approved by ${adminName} and is now published.`,
      link: `/posts/${post.slug}`,
    });
  } catch (err) {
    console.error("Error sending approval notification:", err);
  }
}

/**
 * Admin rejects a post
 */
export async function rejectPost(
  postId: string,
  adminUID: string,
  adminName: string,
  reason: string
): Promise<void> {
  const postRef = doc(db, POSTS_COL, postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error("Post not found");
  }

  const post = postSnap.data() as CMSPost;

  if (post.reviewStatus !== "pending") {
    throw new Error("Post is not pending review");
  }

  const now = Date.now();
  await updateDoc(postRef, {
    status: "draft",
    reviewStatus: "rejected",
    reviewedBy: adminUID,
    reviewedAt: now,
    rejectionReason: reason,
    updatedAt: now,
  });

  // Send notification to author
  try {
    await createNotification({
      userId: post.authorUID,
      type: "post-rejected",
      title: "Post Needs Revision",
      body: `Your post "${post.title}" was not approved. Reason: ${reason}`,
      link: `/dashboard`,
    });
  } catch (err) {
    console.error("Error sending rejection notification:", err);
  }
}

/**
 * List posts pending review (for admin)
 */
export async function listPendingPosts(): Promise<CMSPost[]> {
  const q = query(
    collection(db, POSTS_COL),
    where("reviewStatus", "==", "pending"),
    orderBy("submittedAt", "desc")
  );
  const snap = await getDocs(q);
  const posts: CMSPost[] = [];
  snap.forEach((doc) => posts.push(doc.data() as CMSPost));
  return posts;
}

/**
 * List user's own posts by status
 */
export async function listUserPosts(
  uid: string,
  status?: "draft" | "published" | "scheduled",
  reviewStatus?: "pending" | "approved" | "rejected"
): Promise<CMSPost[]> {
  let q = query(
    collection(db, POSTS_COL),
    where("authorUID", "==", uid),
    orderBy("updatedAt", "desc")
  );

  if (status) {
    q = query(q, where("status", "==", status));
  }

  if (reviewStatus) {
    q = query(q, where("reviewStatus", "==", reviewStatus));
  }

  const snap = await getDocs(q);
  const posts: CMSPost[] = [];
  snap.forEach((doc) => posts.push(doc.data() as CMSPost));
  return posts;
}
