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
  status: 'draft' | 'published' | 'scheduled';
  scheduledFor?: number; // timestamp for scheduled posts
  views: number;
}

export interface CMSComment {
  id: string;
  postId: string;
  parentId?: string | null; // for nesting (null for root comments)
  authorUID: string;
  authorName: string;
  content: string; // markdown/plain
  createdAt: number;
  updatedAt: number;
  likeCount: number;
  dislikeCount: number;
  path: string; // materialized ancestry path for efficient queries e.g. root/child/child
  mentions?: string[]; // optional list of mentioned usernames (lowercase)
}

export interface NewPostInput {
  title: string; content: string; tags: string[]; bannerUrl?: string; pinned?: boolean; status?: 'draft' | 'published' | 'scheduled'; scheduledFor?: number;
}
export interface UpdatePostInput extends Partial<NewPostInput> { id: string; }

export interface NewCommentInput { postId: string; parentId?: string; content: string; mentions?: string[]; }

// Media Library Types
export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: string; // mime type
  size: number; // bytes
  uploadedAt: number;
  uploadedBy: string; // uid
  tags?: string[];
}

// Analytics Types
export interface PostAnalytics {
  postId: string;
  title: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  createdAt: number;
}

export interface TagAnalytics {
  tag: string;
  postCount: number;
  totalViews: number;
}

export interface AnalyticsSummary {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  topPosts: PostAnalytics[];
  tagUsage: TagAnalytics[];
  viewsByDay: { date: string; views: number }[];
}
