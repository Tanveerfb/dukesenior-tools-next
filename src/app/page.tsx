"use client";
import { Container, Row, Col } from "react-bootstrap";
import PostsFeed from "@/components/posts/PostsFeed";
import OpenToDoCard from "@/components/home/OpenToDoCard";

export default function HomePage() {
  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <PostsFeed
            maxFeatured={3}
            maxLatest={3}
            fetchCount={12}
            showSampleFallback={false}
          />
        </Col>
        <Col lg={4} className="d-none d-lg-block">
          <OpenToDoCard />
        </Col>
      </Row>
      {/* Mobile: widgets below posts */}
      <div className="d-lg-none mt-3">
        <OpenToDoCard />
      </div>
    </Container>
  );
}
