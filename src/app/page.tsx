"use client";
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { listPosts } from '@/lib/services/cms';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage(){
  const { user } = useAuth();
  const [posts,setPosts] = useState<any[]>([]); const [loading,setLoading]=useState(false);
  useEffect(()=> { (async()=> {
    setLoading(true);
    try {
      const dbPosts = await listPosts(12);
      // Only use posts returned from Firestore. No static sample fallback here.
      setPosts(dbPosts);
    } finally { setLoading(false);} })(); },[]);
  const pinned = posts.filter(p=> p.pinned);
  const rest = posts.filter(p=> !p.pinned);
  return (
    <Container className="py-4">
      {loading && <Spinner animation="border" />}
      {pinned.length>0 && <section className="mb-5"><h3 className="h5 mb-3">Featured</h3><Row className="g-4">{pinned.map(p=> <PostCard key={p.id} post={p} />)}</Row></section>}
      <section>
        <h3 className="h5 mb-3">Latest</h3>
        {!loading && posts.length === 0 ? (
          <Row>
            <Col>
              <Card className="border-0 bg-light text-center p-4">
                <Card.Body>
                  {!user || !user.admin ? (
                    <>
                      <Card.Text className="h6 text-muted mb-0">No posts available right now.</Card.Text>
                      <Card.Text className="small text-muted">Content will appear here when posts are published. Check back soon.</Card.Text>
                    </>
                  ) : (
                    <>
                      <Card.Text className="h6 text-muted mb-0">No posts available in Firestore.</Card.Text>
                      <Card.Text className="small text-muted">As an admin you can seed sample posts via the Admin panel or create new posts directly.</Card.Text>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row className="g-4">{rest.map(p=> <PostCard key={p.id} post={p} />)}</Row>
        )}
      </section>
    </Container>
  );
}

function PostCard({ post }: { post: any }){
  return (
    <Col md={4} sm={6} xs={12}>
      <Card className="h-100">
        {post.bannerUrl && <div style={{height:160, overflow:'hidden'}}><Card.Img src={post.bannerUrl} alt={post.title} style={{objectFit:'cover', height:'100%', width:'100%'}} /></div>}
        <Card.Body className="d-flex flex-column">
          <Card.Title className="fs-6 d-flex gap-2 align-items-start">{post.title}{post.pinned && <Badge bg="warning" text="dark" className="ms-auto">Pinned</Badge>}{post.id && post.id.startsWith('sample-') && <Badge bg="secondary" className="ms-2">Sample</Badge>}</Card.Title>
          <div className="mb-2 small text-muted">{new Date(post.createdAt).toLocaleDateString()}</div>
        <div className="mb-3" style={{minHeight:40}}>{post.tags?.slice(0,3).map((t:string)=><Badge key={t} bg="info" className="me-1">{t}</Badge>)}</div>
      <Link href={`/posts/${post.slug}`} className="btn btn-outline-primary btn-sm mt-auto" aria-label={`Read ${post.title}`}>Read</Link>
        </Card.Body>
      </Card>
    </Col>
  );
}

