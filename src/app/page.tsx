"use client";
import { Col, Container, Row } from "react-bootstrap";
import HomeHero from "@/components/home/HomeHero";
import PostsFeed from "@/components/posts/PostsFeed";
import HomeSidebar from "@/components/home/HomeSidebar";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Container as="main" className="py-5">
        <Row className="g-4 align-items-start">
          <Col lg={8}>
            <section aria-labelledby="home-updates-heading">
              <header className="mb-4">
                <span className="badge text-bg-secondary text-uppercase small fw-semibold">
                  Latest updates
                </span>
                <h2
                  id="home-updates-heading"
                  className="h4 fw-semibold mt-2 mb-0"
                >
                  Community posts & resource drops
                </h2>
                <p className="text-muted small mb-0">
                  Stay current on announcements, guides, and match recaps from
                  the DukeSenior team.
                </p>
              </header>
              <div className="bg-body border rounded-3 shadow-sm p-4">
                <PostsFeed
                  maxFeatured={3}
                  maxLatest={4}
                  fetchCount={12}
                  showSampleFallback={false}
                />
              </div>
            </section>
          </Col>
          <Col lg={4}>
            <HomeSidebar />
          </Col>
        </Row>
      </Container>
    </>
  );
}
