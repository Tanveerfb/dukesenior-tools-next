"use client";
import { useEffect, useState } from 'react';
import { Container, Table, Spinner, Button, Alert } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { listRecentComments, getPost, deleteComment } from '@/lib/services/cms';

export default function CommentsFeed(){
  const { admin } = useAuth();
  const [loading,setLoading] = useState(false);
  const [rows,setRows] = useState<any[]>([]);
  async function refresh(){
    setLoading(true);
    try {
      const list = await listRecentComments(200);
      const enriched = await Promise.all(list.map(async c => { const post = await getPost(c.postId); return { ...c, postTitle: post?.title||'Unknown'};}));
      setRows(enriched);
    } finally { setLoading(false); }
  }
  useEffect(()=> { refresh(); },[]);
  if(!admin) return <Container className="py-5"><Alert variant="danger">Admin only</Alert></Container>;
  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-3"><h1 className="mb-0 me-auto">Recent Comments</h1><Button size="sm" variant="outline-secondary" onClick={refresh}>Refresh</Button></div>
      <Table hover responsive size="sm" className="align-middle">
        <thead><tr><th>Post</th><th>Excerpt</th><th>Author</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map(r=> <tr key={r.id}><td className="text-truncate" style={{maxWidth:180}}>{r.postTitle}</td><td className="small text-truncate" style={{maxWidth:260}}>{r.content}</td><td className="small">{r.authorName}</td><td className="small">{new Date(r.createdAt).toLocaleString()}</td><td><Button size="sm" variant="outline-danger" onClick={()=> { if(confirm('Delete comment?')) deleteComment(r.id).then(refresh); }}>Delete</Button></td></tr>)}
          {rows.length===0 && !loading && <tr><td colSpan={5} className="text-muted small fst-italic">No comments yet.</td></tr>}
        </tbody>
      </Table>
      {loading && <Spinner animation="border" />}
    </Container>
  );
}
