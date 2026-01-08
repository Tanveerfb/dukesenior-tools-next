"use client";;
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Button,
} from "react-bootstrap";
import InlineLink from '@/components/ui/InlineLink';
import Image from "next/image";
import { motion } from "framer-motion";
import EmptyState from "@/components/ui/EmptyState";
import { FaInbox } from "react-icons/fa";
// ...existing imports above
import { listPosts } from "@/lib/services/cms";
import { samplePosts } from "@/lib/content/samplePosts";

interface Props {
  maxFeatured?: number;
  maxLatest?: number;
  fetchCount?: number;
  showSampleFallback?: boolean; // when true, falls back to sample posts if none returned
}

function PostCard({ post, index }: { post: any; index: number }) {
  return (
    <Col md={4} sm={6} xs={12}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ y: -4 }}
      >
        <Card className="h-100">
          {post.bannerUrl && (
            <div
              style={{ height: 160, overflow: "hidden", position: "relative" }}
            >
              <Image
                src={post.bannerUrl}
                alt={post.title}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </div>
          )}
          <Card.Body className="d-flex flex-column">
            <div className="d-flex align-items-start mb-1 justify-content-between">
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <Card.Title
                  className="fs-6 mb-0 text-truncate"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {post.title}
                </Card.Title>
              </div>
              <div className="d-flex align-items-center gap-2 ms-2 d-none d-sm-flex">
                {post.pinned && (
                  <Badge bg="warning" text="dark">
                    Pinned
                  </Badge>
                )}
                {post.id?.startsWith?.("sample-") && (
                  <Badge bg="secondary">Sample</Badge>
                )}
              </div>
            </div>
            <div className="mb-2 small text-muted">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <div className="mb-3" style={{ minHeight: 40 }}>
              {post.tags?.slice(0, 3).map((t: string) => (
                <Badge key={t} bg="info" className="me-1">
                  {t}
                </Badge>
              ))}
            </div>
            <Button
              as={InlineLink as unknown as any}
              href={`/posts/${post.slug}`}
              variant="primary"
              size="sm"
              className="mt-auto"
              aria-label={`Read ${post.title}`}
            >
              Read
            </Button>
          </Card.Body>
        </Card>
      </motion.div>
    </Col>
  );
}

export default function PostsFeed({
  maxFeatured = 3,
  maxLatest = 3,
  fetchCount = 12,
  showSampleFallback = false,
}: Props) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const dbPosts = await listPosts(fetchCount);
        if (!dbPosts || dbPosts.length === 0) {
          setPosts(showSampleFallback ? samplePosts.slice(0, fetchCount) : []);
        } else setPosts(dbPosts);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchCount, showSampleFallback]);

  const featured = useMemo(
    () => posts.filter((p) => p.pinned).slice(0, maxFeatured),
    [posts, maxFeatured]
  );
  const latest = useMemo(
    () => posts.filter((p) => !p.pinned).slice(0, maxLatest),
    [posts, maxLatest]
  );

  return (
    <Container className="py-0">
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading posts...</span>
          </Spinner>
          <p className="text-muted mt-3">Loading posts...</p>
        </div>
      )}

      {featured.length > 0 && !loading && (
        <section className="mb-4">
          <h3 className="h6 mb-3">Featured</h3>
          <Row className="g-4">
            {featured.map((p, idx) => (
              <PostCard key={p.id} post={p} index={idx} />
            ))}
          </Row>
        </section>
      )}

      <section>
        {!loading && posts.length === 0 ? (
          <EmptyState
            icon={<FaInbox />}
            title="No posts available"
            description="Check back soon for new community updates, announcements, and guides."
          />
        ) : (
          !loading && (
            <>
              <h3 className="h6 mb-3">Latest</h3>
              <Row className="g-4">
                {latest.map((p, idx) => (
                  <PostCard key={p.id} post={p} index={idx + featured.length} />
                ))}
              </Row>
            </>
          )
        )}
      </section>
    </Container>
  );
}
