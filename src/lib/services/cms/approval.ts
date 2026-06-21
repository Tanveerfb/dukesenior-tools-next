import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { CMSPost, NewPostInput } from "@/types/cms";
import {
  awardXP,
  incrementStat,
  getUserGamification,
} from "@/lib/services/gamification";
import { XP_REWARDS } from "@/types/gamification";
import { createNotification } from "@/lib/services/notifications";
import { POSTS_COL } from "./constants";
import { slugify } from "./posts";

export async function createPostWithApproval(
  uid: string,
  authorName: string,
  input: NewPostInput,
  isAdmin: boolean,
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const ref = doc(db, POSTS_COL, id);

  let status = input.status || "draft";
  let needsApproval = false;
  let reviewStatus: "pending" | "approved" | "rejected" | undefined = undefined;
  let submittedAt: number | undefined = undefined;

  if (!isAdmin && (status === "published" || status === "scheduled")) {
    status = "draft";
    needsApproval = true;
    reviewStatus = "pending";
    submittedAt = now;
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
    reactionCounts: { like: 0, love: 0, laugh: 0, insightful: 0, fire: 0 },
    needsApproval,
    reviewStatus,
    submittedAt,
  };

  await setDoc(ref, post);

  try {
    if (status === "draft") {
      const xp = reviewStatus === "pending"
        ? XP_REWARDS.POST_SUBMITTED_FOR_REVIEW
        : XP_REWARDS.POST_DRAFT_SAVED;
      const reason = reviewStatus === "pending"
        ? "Submitted post for review"
        : "Saved post draft";
      await awardXP(uid, xp, reason, "post", { postId: id });
      await incrementStat(uid, "postsDrafted", 1);
    } else if (status === "published") {
      const gamification = await getUserGamification(uid);
      const isFirstPost = !gamification || gamification.stats.postsCreated === 0;
      await awardXP(uid, XP_REWARDS.POST_CREATED, "Created a post", "post", { postId: id });
      if (isFirstPost) {
        await awardXP(uid, XP_REWARDS.FIRST_POST, "Created first post", "post", {
          postId: id,
          milestone: true,
        });
      }
      await incrementStat(uid, "postsCreated", 1);
      await incrementStat(uid, "postsPublished", 1);
    }
  } catch (err) {
    console.error("Error awarding XP for post creation:", err);
  }

  return id;
}

export async function submitPostForReview(postId: string, uid: string): Promise<void> {
  const postRef = doc(db, POSTS_COL, postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) throw new Error("Post not found");

  const post = postSnap.data() as CMSPost;
  if (post.authorUID !== uid) throw new Error("Not authorized to submit this post");
  if (post.status !== "draft") throw new Error("Only draft posts can be submitted for review");

  const now = Date.now();
  await updateDoc(postRef, {
    needsApproval: true,
    reviewStatus: "pending",
    submittedAt: now,
    updatedAt: now,
  });

  try {
    await awardXP(uid, XP_REWARDS.POST_SUBMITTED_FOR_REVIEW, "Submitted post for review", "post", { postId });
  } catch (err) {
    console.error("Error awarding XP for submission:", err);
  }
}

export async function approvePost(
  postId: string,
  adminUID: string,
  adminName: string,
): Promise<void> {
  const postRef = doc(db, POSTS_COL, postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) throw new Error("Post not found");

  const post = postSnap.data() as CMSPost;
  if (post.reviewStatus !== "pending") throw new Error("Post is not pending review");

  const now = Date.now();
  await updateDoc(postRef, {
    status: "published",
    reviewStatus: "approved",
    reviewedBy: adminUID,
    reviewedAt: now,
    updatedAt: now,
  });

  try {
    const gamification = await getUserGamification(post.authorUID);
    await awardXP(post.authorUID, XP_REWARDS.POST_APPROVED_BONUS, "Post approved by admin", "post", { postId });
    await awardXP(post.authorUID, XP_REWARDS.POST_CREATED, "Post published", "post", { postId });
    await incrementStat(post.authorUID, "postsPublished", 1);
    await incrementStat(post.authorUID, "postsCreated", 1);
    // gamification used to check first-published milestone — extend here when achievement system is wired
    void gamification;
  } catch (err) {
    console.error("Error awarding XP for approval:", err);
  }

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

export async function rejectPost(
  postId: string,
  adminUID: string,
  adminName: string,
  reason: string,
): Promise<void> {
  const postRef = doc(db, POSTS_COL, postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) throw new Error("Post not found");

  const post = postSnap.data() as CMSPost;
  if (post.reviewStatus !== "pending") throw new Error("Post is not pending review");

  const now = Date.now();
  await updateDoc(postRef, {
    status: "draft",
    reviewStatus: "rejected",
    reviewedBy: adminUID,
    reviewedAt: now,
    rejectionReason: reason,
    updatedAt: now,
  });

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
