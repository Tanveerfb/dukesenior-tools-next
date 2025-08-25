"use client";
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Form, InputGroup } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import { listPosts } from '@/lib/services/cms';
import { samplePosts } from '@/lib/content/samplePosts';

function excerpt(text = '', length = 140) {
  if (!text) return '';
  return text.length > length ? text.slice(0, length).trim() + '…' : text;
}

export default function PostsIndex(){
  const [posts,setPosts] = useState<any[]>([]);
  const [loading,setLoading] = useState(false);
  const [q,setQ] = useState('');

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      try{
        const dbPosts = await listPosts(200);
        setPosts(dbPosts.length ? dbPosts : samplePosts);
      }finally{ setLoading(false); }
    })();
  },[]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter(p => (p.title||'').toLowerCase().includes(term) || (p.excerpt||'').toLowerCase().includes(term) || (p.tags||[]).join(' ').toLowerCase().includes(term));
  },[q,posts]);

  // featured = pinned first
  const featured = filtered.filter(p=>p.pinned).slice(0,3);
  const list = filtered.filter(p=>!p.pinned);

  return (
    <Container className="py-5">
      <Row className="align-items-center mb-4">
        <Col md={8}>
          <h1 className="mb-0">Latest posts</h1>
          <p className="text-muted mb-0">News, updates and writeups from the community.</p>
        </Col>
        <Col md={4} className="mt-3 mt-md-0">
          <InputGroup>
            <Form.Control placeholder="Search posts, tags, authors..." value={q} onChange={e=>setQ(e.target.value)} />
            <Button variant="outline-secondary" onClick={()=>setQ('')}>Clear</Button>
          </InputGroup>
        </Col>
      </Row>

      {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}

      {featured.length>0 && (
        <Row className="g-4 mb-4">
          {featured.map(p=> (
            <Col key={p.id} md={4}>
              <Card className="h-100 shadow-sm border-0" style={{overflow:'hidden'}}>
                {p.bannerUrl && (
                  <div style={{height:180,overflow:'hidden',position:'relative'}}>
                    <Image src={p.bannerUrl} alt={p.title} fill style={{objectFit:'cover'}} unoptimized />
                  </div>
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-start mb-2 justify-content-between">
                    <div style={{flex: '1 1 auto', minWidth: 0}}>
                      <Card.Title className="mb-0 text-truncate" style={{marginBottom:0, whiteSpace: 'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.title}</Card.Title>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0 flex-wrap">
                      {p.pinned && <Badge bg="warning" text="dark" className="d-none d-sm-inline">Pinned</Badge>}
                      {p.id?.startsWith?.('sample-') && <Badge bg="secondary" className="d-none d-sm-inline">Sample</Badge>}
                    </div>
                  </div>
                  <div className="text-muted small mb-2">{new Date(p.createdAt).toLocaleDateString()} • {p.author || 'DukeSenior'}</div>
                  <Card.Text className="mb-3 text-truncate">{excerpt(p.excerpt || p.content || '', 160)}</Card.Text>
                  <div className="mt-auto">
                    <Link href={`/posts/${p.slug}`} className="btn btn-primary w-100" aria-label={`Read ${p.title}`}>
                      Read
                    </Link>
                    <div className="mt-2 small text-muted text-end">{p.readTime || ''}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Row className="g-4">
        {list.map(p=> (
          <Col key={p.id} md={6} lg={4}>
            <Card className="h-100 shadow-sm card-hover">
              <Row className="g-0 align-items-stretch">
                <Col xs={5} className="d-none d-sm-block">
                  {p.bannerUrl ? (
                    <div style={{height:'100%',minHeight:120,overflow:'hidden',position:'relative'}}>
                      <Image src={p.bannerUrl} alt={p.title} unoptimized style={{objectFit:'cover', objectPosition:'center center'}} fill />
                    </div>
                  ) : (
                    <div style={{height:120,background:'#f3f6fb'}} />
                  )}
                </Col>
                <Col xs={12} sm={7}>
                  <Card.Body className="d-flex flex-column h-100">
                    <div className="d-flex align-items-start mb-1">
                      <Card.Title className="fs-6 mb-0">{p.title}</Card.Title>
                      {p.pinned && <Badge bg="warning" text="dark" className="ms-auto d-none d-sm-inline">Pinned</Badge>}
                    </div>
                    <div className="text-muted small mb-2">{new Date(p.createdAt).toLocaleDateString()}</div>
                    <Card.Text className="mb-3 small text-muted" style={{minHeight:40}}>{excerpt(p.excerpt || p.content || '', 120)}</Card.Text>
                    <div className="mt-auto">
                      <div className="d-flex flex-wrap mb-2">{p.tags?.slice(0,3).map((t:string)=><Badge key={t} bg="info" className="me-2 mb-2">{t}</Badge>)}</div>
                      <Link href={`/posts/${p.slug}`} className="btn btn-outline-primary btn-sm w-100" aria-label={`Read ${p.title}`}>
                        Read
                      </Link>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}

        {!loading && posts.length===0 && <Col><div className="text-muted fst-italic small">No posts yet.</div></Col>}
      </Row>
    </Container>
  );
}
