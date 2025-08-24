"use client";
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import Link from 'next/link';
import { listPosts } from '@/lib/services/cms';
import { samplePosts } from '@/lib/content/samplePosts';

export default function PostsIndex(){
  const [posts,setPosts] = useState<any[]>([]); const [loading,setLoading] = useState(false);
  useEffect(()=> { (async()=> { setLoading(true); try { const dbPosts = await listPosts(200); setPosts(dbPosts.length? dbPosts : samplePosts); } finally { setLoading(false); } })(); },[]);
  return (
    <Container className="py-4">
      <h1 className="mb-4">Posts</h1>
      {loading && <Spinner animation="border" />}
      <Row className="g-4">
        {posts.map(p=> <Col key={p.id} md={4} sm={6} xs={12}>
          <Card className="h-100">
            {p.bannerUrl && <div style={{height:160, overflow:'hidden'}}><Card.Img src={p.bannerUrl} alt={p.title} style={{objectFit:'cover', height:'100%', width:'100%'}} /></div>}
            <Card.Body className="d-flex flex-column">
              <Card.Title className="fs-5 d-flex align-items-start gap-2">{p.title}{p.pinned && <Badge bg="warning" text="dark" className="ms-auto">Pinned</Badge>}</Card.Title>
              <div className="mb-2 small text-muted">{new Date(p.createdAt).toLocaleDateString()}</div>
              <div className="mb-2" style={{minHeight:40}}>{p.tags?.slice(0,4).map((t:string)=><Badge key={t} bg="info" className="me-1">{t}</Badge>)}</div>
              <Link href={`/posts/${p.slug}`} passHref legacyBehavior><Button as="a" variant="outline-primary" size="sm" className="mt-auto">Read</Button></Link>
            </Card.Body>
          </Card>
        </Col>)}
        {!loading && posts.length===0 && <Col><div className="text-muted fst-italic small">No posts yet.</div></Col>}
      </Row>
    </Container>
  );
}
