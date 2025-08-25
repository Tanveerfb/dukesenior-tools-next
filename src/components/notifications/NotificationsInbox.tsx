"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

type NotificationItem = {
  id: string;
  fromUsername?: string;
  postSlug?: string;
  postId?: string;
  commentId?: string;
  context?: string;
  createdAt?: any;
  read?: boolean;
};

export default function NotificationsInbox(){
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NotificationItem[]>([]);

  useEffect(()=>{
    if(!user) { setNotes([]); setLoading(false); return; }
    const col = collection(db, `notifications_${user.uid}`);
    const q = query(col, orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap => {
      const list: NotificationItem[] = [];
      snap.forEach(d => { const data = d.data(); list.push({ id: d.id, ...data } as NotificationItem); });
      setNotes(list);
      setLoading(false);
    }, err => { console.error('notifications listener error', err); setLoading(false); });
    return () => unsub();
  }, [user]);

  async function markRead(id:string){
    if(!user) return;
    try{ await updateDoc(doc(db, `notifications_${user.uid}`, id), { read: true }); }
    catch(e){ console.error(e); }
  }

  async function markAllRead(){
    if(!user) return;
    try{
      const promises = notes.filter(n=> !n.read).map(n => updateDoc(doc(db, `notifications_${user.uid}`, n.id), { read: true }));
      await Promise.all(promises);
    }catch(e){ console.error(e); }
  }

  if(!user) return (
    <div className="container py-4">
      <h1>Notifications</h1>
      <div className="alert alert-secondary">Please <Link href="/login">log in</Link> to view your notifications.</div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h2>Notifications</h2>
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" onClick={markAllRead} disabled={notes.every(n=>n.read)}>
            Mark all read
          </Button>
        </div>
      </div>

      {loading && <div className="py-4 text-center"><Spinner animation="border" /></div>}

      {!loading && notes.length === 0 && (
        <div className="alert alert-secondary">No notifications</div>
      )}

      <div className="list-group">
        {notes.map(n => (
          <div key={n.id} className={`list-group-item d-flex justify-content-between align-items-start ${n.read? 'bg-white':'bg-body-tertiary'}`}>
            <div style={{flex:1}}>
              <div className="mb-1"><strong>{n.fromUsername || 'Someone'}</strong> {n.context ? <span className="text-muted">• {n.context}</span> : <span className="text-muted">mentioned you</span>}</div>
              <div className="small text-muted">
                {n.postSlug ? <Link href={`/posts/${n.postSlug}`}>View post</Link> : (n.postId ? <Link href={`/posts/${n.postId}`}>View post</Link> : null)}
                {n.commentId ? <span> • {n.postSlug ? <Link href={`/posts/${n.postSlug}#comment-${n.commentId}`}>View comment</Link> : (n.postId ? <Link href={`/posts/${n.postId}#comment-${n.commentId}`}>View comment</Link> : null)}</span> : null}
              </div>
              <div className="small text-muted mt-1">{n.createdAt ? (n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : new Date(n.createdAt).toLocaleString()) : ''}</div>
            </div>
            <div className="ms-3 d-flex flex-column align-items-end gap-2">
              {!n.read && <Badge bg="danger">New</Badge>}
              {!n.read ? (
                <Button size="sm" onClick={()=> markRead(n.id)} variant="outline-secondary">Mark</Button>
              ) : (
                <Button size="sm" variant="outline-secondary" disabled>Read</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
