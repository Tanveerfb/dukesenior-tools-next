"use client";;
import { Container } from "react-bootstrap";
import PostsFeed from "@/components/posts/PostsFeed";

export default function HomePage() {
  return (
    <Container className="py-4">
      <PostsFeed
        maxFeatured={3}
        maxLatest={3}
        fetchCount={12}
        showSampleFallback={false}
      />
    </Container>
  );
}
