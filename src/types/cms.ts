export interface CMSPost {
  id: string;
  title: string;
  slug: string;
  content: string; // markdown
  createdAt: number;
  updatedAt: number;
  authorUID: string;
  authorName: string;
  bannerUrl?: string;
  tags: string[];
  pinned?: boolean;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
}

export interface CMSComment {
  id: string;
  postId: string;
  parentId?: string; // for nesting
  authorUID: string;
  authorName: string;
  content: string; // markdown/plain
  createdAt: number;
  updatedAt: number;
  likeCount: number;
  dislikeCount: number;
  path: string; // materialized ancestry path for efficient queries e.g. root/child/child
}

export interface NewPostInput {
  title: string; content: string; tags: string[]; bannerUrl?: string; pinned?: boolean;
}
export interface UpdatePostInput extends Partial<NewPostInput> { id: string; }

export interface NewCommentInput { postId: string; parentId?: string; content: string; }
