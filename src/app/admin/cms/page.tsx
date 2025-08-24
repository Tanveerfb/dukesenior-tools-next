"use client";
import { useState, useEffect } from 'react';
import { Container, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { listPosts, deletePost, setPostPinned, seedSamplePostsIfEmpty, seedSingleSamplePost } from '@/lib/services/cms';

export default function AdminCMSPage(){
  const { admin } = useAuth();
  const [posts,setPosts] = useState<any[]>([]); const [loading,setLoading] = useState(false);
  const [seeding,setSeeding] = useState(false);
  const [seedMsg,setSeedMsg] = useState<string|undefined>();
  const [seedVariant,setSeedVariant] = useState<'success'|'danger'|'info'>('info');
  async function refresh(){ setLoading(true); try { setPosts(await listPosts(200)); } finally { setLoading(false);} }
  useEffect(()=> { refresh(); },[]);
  if(!admin) return <Container className="py-5"><Alert variant="danger">Admin only</Alert></Container>;
  async function seedAll(){
    setSeeding(true); setSeedMsg(undefined);
    try {
      const changed = await seedSamplePostsIfEmpty();
      setSeedVariant(changed? 'success':'info');
      setSeedMsg(changed? 'Sample posts seeded.' : 'Database already has posts; no samples added.');
    } catch(err:any){ setSeedVariant('danger'); setSeedMsg('Seed failed: ' + (err?.message||'unknown error')); }
    finally { setSeeding(false); refresh(); }
  }
  async function seedOne(slug: string){
    setSeeding(true); setSeedMsg(undefined);
    try {
      const added = await seedSingleSamplePost(slug);
      setSeedVariant(added? 'success':'info');
      setSeedMsg(added? 'Sample post added.' : 'That sample already exists.');
    } catch(err:any){ setSeedVariant('danger'); setSeedMsg('Seed failed: ' + (err?.message||'unknown error')); }
    finally { setSeeding(false); refresh(); }
  }
  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-3">
        <h1 className="mb-0 me-auto">CMS Admin</h1>
  <Link href="/admin/cms/new" passHref legacyBehavior><Button as="a" variant="success">New Post</Button></Link>
  <Link href="/admin/cms/comments" passHref legacyBehavior><Button as="a" variant="outline-info" className="ms-2">New Comments</Button></Link>
      </div>
      <div className="mb-3 d-flex flex-wrap gap-2">
        <Button size="sm" variant="outline-secondary" disabled={seeding} onClick={seedAll}>{seeding? 'Seeding...':'Seed Samples (if empty)'}</Button>
        <Button size="sm" variant="outline-secondary" disabled={seeding} onClick={()=> seedOne('grafton-farmhouse-rework-phasmophobia-v0-14-0-0')}>Seed Grafton</Button>
        <Button size="sm" variant="outline-secondary" disabled={seeding} onClick={()=> seedOne('grn-ssj2-kefla-in-dragon-ball-legends')}>Seed Kefla</Button>
      </div>
      {seedMsg && <Alert variant={seedVariant} className="py-2 small">{seedMsg}</Alert>}
      <p className="text-muted small">Listing latest posts. Click Edit to modify or use New Post.</p>
      <h3 className="mb-3">Posts {loading && <Spinner size="sm" animation="border" className="ms-2" />}</h3>
      <Table hover responsive size="sm" className="align-middle">
        <thead><tr><th>Title</th><th>Tags</th><th>Pinned</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {posts.map(p=> (
            <tr key={p.id}>
              <td className="fw-semibold">{p.title}</td>
              <td>{p.tags?.map((t:string)=><Badge key={t} bg="info" className="me-1">{t}</Badge>)}</td>
              <td>{p.pinned? <Badge bg="warning" text="dark">Pinned</Badge>: ''}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td className="d-flex gap-2">
                <Link href={`/admin/cms/new?id=${p.id}`} passHref legacyBehavior><Button as="a" size="sm" variant="outline-primary">Edit</Button></Link>
                <Button size="sm" variant="outline-secondary" onClick={()=> { setPostPinned(p.id, !p.pinned).then(refresh); }}>{p.pinned? 'Unpin':'Pin'}</Button>
                <Button size="sm" variant="outline-danger" onClick={()=> { if(confirm('Delete post?')) deletePost(p.id).then(refresh); }}>Delete</Button>
              </td>
            </tr>
          ))}
          {posts.length===0 && <tr><td colSpan={5} className="text-muted small fst-italic">No posts yet.</td></tr>}
        </tbody>
      </Table>
    </Container>
  );
}
