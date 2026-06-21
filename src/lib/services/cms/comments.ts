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
import { CMSComment, NewCommentInput } from "@/types/cms";
import { awardXP, incrementStat } from "@/lib/services/gamification";
import { XP_REWARDS } from "@/types/gamification";
import { POSTS_COL, COMMENTS_COL } from "./constants";

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

  try {
    await awardXP(uid, XP_REWARDS.COMMENT_POSTED, "Posted a comment", "comment", {
      commentId: id,
      postId: input.postId,
    });
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
  //  is a high-value Unicode sentinel used for Firestore prefix range queries
  const sentinel = "";
  const q = query(
    collection(db, COMMENTS_COL),
    where("path", ">=", parent.path + "/"),
    where("path", "<=", parent.path + "/" + sentinel),
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
