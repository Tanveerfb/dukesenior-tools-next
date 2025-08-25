"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import { listPosts } from '@/lib/services/cms';
import { samplePosts } from '@/lib/content/samplePosts';

interface Props {
  maxFeatured?: number;
  maxLatest?: number;
  fetchCount?: number;
  showSampleFallback?: boolean; // when true, falls back to sample posts if none returned
}

function PostCard({ post }: { post: any }){
  return (
    <Col md={4} sm={6} xs={12}>
      <Card className="h-100">
        {post.bannerUrl && (
          <div style={{height:160, overflow:'hidden', position:'relative'}}>
            <Image src={post.bannerUrl} alt={post.title} fill style={{objectFit:'cover'}} unoptimized />
          </div>
        )}
        <Card.Body className="d-flex flex-column">
          <div className="d-flex align-items-start mb-1 justify-content-between">
            <div style={{flex: '1 1 auto', minWidth: 0}}>
              <Card.Title className="fs-6 mb-0 text-truncate" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{post.title}</Card.Title>
            </div>
            <div className="d-flex align-items-center gap-2 ms-2 d-none d-sm-flex">
              {post.pinned && <Badge bg="warning" text="dark">Pinned</Badge>}
              {post.id?.startsWith?.('sample-') && <Badge bg="secondary">Sample</Badge>}
            </div>
          </div>
          <div className="mb-2 small text-muted">{new Date(post.createdAt).toLocaleDateString()}</div>
          <div className="mb-3" style={{minHeight:40}}>{post.tags?.slice(0,3).map((t:string)=><Badge key={t} bg="info" className="me-1">{t}</Badge>)}</div>
          <Link href={`/posts/${post.slug}`} className="btn btn-outline-primary btn-sm mt-auto" aria-label={`Read ${post.title}`}>Read</Link>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default function PostsFeed({ maxFeatured=3, maxLatest=3, fetchCount=12, showSampleFallback=false }: Props){
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ (async ()=>{
    setLoading(true);
    try{
      const dbPosts = await listPosts(fetchCount);
      if(!dbPosts || dbPosts.length === 0){
        setPosts(showSampleFallback ? samplePosts.slice(0, fetchCount) : []);
      } else setPosts(dbPosts);
    }finally{ setLoading(false); }
  })(); }, [fetchCount, showSampleFallback]);

  const featured = useMemo(()=> posts.filter(p=> p.pinned).slice(0, maxFeatured), [posts, maxFeatured]);
  const latest = useMemo(()=> posts.filter(p=> !p.pinned).slice(0, maxLatest), [posts, maxLatest]);

  return (
    <Container className="py-0">
      {loading && <div className="text-center py-3"><Spinner animation="border" /></div>}

      {featured.length > 0 && (
        <section className="mb-4">
          <h3 className="h6 mb-3">Featured</h3>
          <Row className="g-4">
            {featured.map(p=> <PostCard key={p.id} post={p} />)}
          </Row>
        </section>
      )}

      <section>
        <h3 className="h6 mb-3">Latest</h3>
        {!loading && posts.length === 0 ? (
          <Card className="border-0 bg-light text-center p-4"><Card.Body><Card.Text className="h6 text-muted mb-0">No posts available.</Card.Text></Card.Body></Card>
        ) : (
          <Row className="g-4">
            {latest.map(p=> <PostCard key={p.id} post={p} />)}
          </Row>
        )}
      </section>
    </Container>
  );
}
