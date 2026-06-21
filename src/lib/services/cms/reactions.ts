import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { CMSPost, ReactionType } from "@/types/cms";
import { awardXP } from "@/lib/services/gamification";
import { XP_REWARDS } from "@/types/gamification";
import { POSTS_COL, COMMENTS_COL, POST_REACTIONS_COL, COMMENT_REACTIONS_COL } from "./constants";
import { getPost } from "./posts";

export async function reactToPost(
  id: string,
  type: "like" | "dislike",
  delta = 1,
) {
  const field = type === "like" ? "likeCount" : "dislikeCount";
  await updateDoc(doc(db, POSTS_COL, id), { [field]: increment(delta) });
}

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
    if (prev === reaction) return;
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

export async function reactToPostForUserV2(
  postId: string,
  uid: string,
  reactionType: ReactionType,
): Promise<void> {
  const reactionId = postId + "_" + uid;
  const reactionRef = doc(db, POST_REACTIONS_COL, reactionId);
  const postRef = doc(db, POSTS_COL, postId);

  await runTransaction(db, async (tx) => {
    const reactionSnap = await tx.get(reactionRef);
    const postSnap = await tx.get(postRef);

    if (!postSnap.exists()) throw new Error("Post not found");

    const post = postSnap.data() as CMSPost;
    const prevReaction = reactionSnap.exists()
      ? (reactionSnap.data() as any).type
      : null;

    if (prevReaction === reactionType) return;

    const reactionCounts = post.reactionCounts || {
      like: 0,
      love: 0,
      laugh: 0,
      insightful: 0,
      fire: 0,
    };

    if (prevReaction) {
      reactionCounts[prevReaction as ReactionType] = Math.max(
        0,
        reactionCounts[prevReaction as ReactionType] - 1,
      );
    }
    reactionCounts[reactionType] = (reactionCounts[reactionType] || 0) + 1;

    if (!reactionSnap.exists()) {
      tx.set(reactionRef, { postId, uid, type: reactionType, createdAt: Date.now() });
    } else {
      tx.update(reactionRef, { type: reactionType, createdAt: Date.now() });
    }
    tx.update(postRef, { reactionCounts });
  });

  try {
    const post = await getPost(postId);
    if (post && post.authorUID !== uid) {
      const xpMap: Record<ReactionType, number> = {
        like: XP_REWARDS.REACTION_LIKE_RECEIVED,
        love: XP_REWARDS.REACTION_LOVE_RECEIVED,
        insightful: XP_REWARDS.REACTION_INSIGHTFUL_RECEIVED,
        fire: XP_REWARDS.REACTION_FIRE_RECEIVED,
        laugh: XP_REWARDS.REACTION_LAUGH_RECEIVED,
      };
      await awardXP(
        post.authorUID,
        xpMap[reactionType],
        `Received ${reactionType} reaction`,
        "post",
        { postId, reactionType },
      );
    }
  } catch (err) {
    console.error("Error awarding XP for reaction:", err);
  }
}

export async function getUserPostReactionV2(
  postId: string,
  uid: string,
): Promise<ReactionType | undefined> {
  const snap = await getDoc(doc(db, POST_REACTIONS_COL, postId + "_" + uid));
  return snap.exists() ? (snap.data() as any).type : undefined;
}

export async function getPostReactors(
  postId: string,
  reactionType: ReactionType,
  limitCount = 5,
): Promise<{ uid: string; createdAt: number }[]> {
  const q = query(
    collection(db, POST_REACTIONS_COL),
    where("postId", "==", postId),
    where("type", "==", reactionType),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  const reactors: { uid: string; createdAt: number }[] = [];
  snap.forEach((d) => {
    const data = d.data();
    reactors.push({ uid: data.uid, createdAt: data.createdAt });
  });
  return reactors;
}
