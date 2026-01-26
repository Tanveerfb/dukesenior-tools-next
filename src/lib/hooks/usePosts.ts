import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPosts,
  getPost,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  setPostPinned,
} from "@/lib/services/cms";
import { NewPostInput, UpdatePostInput } from "@/types/cms";

/**
 * React Query hook to fetch all posts
 */
export function usePosts(limit = 50) {
  return useQuery({
    queryKey: ["posts", limit],
    queryFn: () => listPosts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * React Query hook to fetch a single post by ID
 */
export function usePost(id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * React Query hook to fetch a single post by slug
 */
export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: ["post", "slug", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * React Query mutation hook to create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      authorName,
      input,
    }: {
      uid: string;
      authorName: string;
      input: NewPostInput;
    }) => createPost(uid, authorName, input),
    onSuccess: () => {
      // Invalidate posts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * React Query mutation hook to update a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePostInput) => updatePost(input),
    onSuccess: (_, variables) => {
      // Invalidate specific post and posts list
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * React Query mutation hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * React Query mutation hook to pin/unpin a post
 */
export function useSetPostPinned() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      setPostPinned(id, pinned),
    onSuccess: (_, variables) => {
      // Invalidate specific post and posts list
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
