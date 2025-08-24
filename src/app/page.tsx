"use client";
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import Link from 'next/link';
import { listPosts } from '@/lib/services/cms';
import { samplePosts } from '@/lib/content/samplePosts';

export default function HomePage(){
  const [posts,setPosts] = useState<any[]>([]); const [loading,setLoading]=useState(false);
  useEffect(()=> { (async()=> { setLoading(true); try { const dbPosts = await listPosts(12); setPosts(dbPosts.length? dbPosts : samplePosts); } finally { setLoading(false);} })(); },[]);
  const pinned = posts.filter(p=> p.pinned);
  const rest = posts.filter(p=> !p.pinned);
  return (
    <Container className="py-4">
      <h1 className="fw-bold mb-4">The Lair of Evil</h1>
      {loading && <Spinner animation="border" />}
      {pinned.length>0 && <section className="mb-5"><h3 className="h5 mb-3">Featured</h3><Row className="g-4">{pinned.map(p=> <PostCard key={p.id} post={p} />)}</Row></section>}
      <section><h3 className="h5 mb-3">Latest</h3><Row className="g-4">{rest.map(p=> <PostCard key={p.id} post={p} />)}{!loading && posts.length===0 && <Col><div className="text-muted small fst-italic">No posts yet.</div></Col>}</Row></section>
    </Container>
  );
}

function PostCard({ post }: { post: any }){
  return (
    <Col md={4} sm={6} xs={12}>
      <Card className="h-100">
        {post.bannerUrl && <div style={{height:160, overflow:'hidden'}}><Card.Img src={post.bannerUrl} alt={post.title} style={{objectFit:'cover', height:'100%', width:'100%'}} /></div>}
        <Card.Body className="d-flex flex-column">
          <Card.Title className="fs-6 d-flex gap-2 align-items-start">{post.title}{post.pinned && <Badge bg="warning" text="dark" className="ms-auto">Pinned</Badge>}</Card.Title>
          <div className="mb-2 small text-muted">{new Date(post.createdAt).toLocaleDateString()}</div>
          <div className="mb-3" style={{minHeight:40}}>{post.tags?.slice(0,3).map((t:string)=><Badge key={t} bg="info" className="me-1">{t}</Badge>)}</div>
          <Link href={`/posts/${post.slug}`} passHref legacyBehavior><Button as="a" size="sm" variant="outline-primary" className="mt-auto">Read</Button></Link>
        </Card.Body>
      </Card>
    </Col>
  );
}

