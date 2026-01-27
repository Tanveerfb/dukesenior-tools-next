"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Stack,
  Typography,
  Button,
  Skeleton,
} from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { listPosts } from "@/lib/services/cms";
import { samplePosts } from "@/lib/content/samplePosts";
import type { CMSPost } from "@/types/cms";
import { Inbox as InboxIcon } from "@mui/icons-material";

const MotionCard = motion.create(Card);

interface FeaturedPostsProps {
  maxFeatured?: number;
  showSampleFallback?: boolean;
}

function PostCardSkeleton() {
  return (
    <Card sx={{ height: "100%" }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={32} width="80%" />
        <Skeleton variant="text" height={20} width="40%" sx={{ mt: 1 }} />
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Stack>
        <Skeleton variant="rectangular" height={36} width="100%" sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );
}

function PostCard({ post, index }: { post: CMSPost; index: number }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ y: -6, boxShadow: 8 }}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
        }}
      >
        {post.bannerUrl && (
          <CardMedia
            component="img"
            height="200"
            image={post.bannerUrl}
            alt={post.title}
            sx={{ objectFit: "cover" }}
          />
        )}
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            {post.pinned && (
              <Chip label="Pinned" size="small" color="warning" />
            )}
            {post.id?.startsWith?.("sample-") && (
              <Chip label="Sample" size="small" color="secondary" />
            )}
          </Stack>

          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "3rem",
              fontWeight: 600,
            }}
          >
            {post.title}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            · By {post.authorName}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
            {post.tags?.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>

          <Box sx={{ mt: "auto" }}>
            <Button
              component={Link}
              href={`/posts/${post.slug}`}
              variant="contained"
              size="small"
              fullWidth
              sx={{ textTransform: "none" }}
            >
              Read More
            </Button>
          </Box>
        </CardContent>
      </MotionCard>
    </Grid>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <InboxIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />
      <Typography variant="h6" color="text.secondary">
        No featured posts yet
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Check back soon for new community updates and announcements
      </Typography>
    </Box>
  );
}

export default function FeaturedPosts({
  maxFeatured = 3,
  showSampleFallback = false,
}: FeaturedPostsProps) {
  const [posts, setPosts] = useState<CMSPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const dbPosts = await listPosts(12);
        if (!dbPosts || dbPosts.length === 0) {
          setPosts(showSampleFallback ? samplePosts.slice(0, maxFeatured) : []);
        } else {
          // Get pinned posts first, then latest
          const pinnedPosts = dbPosts.filter((p) => p.pinned).slice(0, maxFeatured);
          setPosts(pinnedPosts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts(showSampleFallback ? samplePosts.slice(0, maxFeatured) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [maxFeatured, showSampleFallback]);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(maxFeatured)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <PostCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <Grid container spacing={3}>
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </Grid>
  );
}
