"use client";
import React from 'react';
import { Button } from 'react-bootstrap';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AboutEditor({ uid, bio }: { uid: string; bio?: string }){
  const { user } = useAuth();
  const isOwner = !!(user?.uid && uid && user.uid === uid);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(bio || '');
  const [saving, setSaving] = React.useState(false);

  async function save(){
    if (!isOwner) return;
    setSaving(true);
    try{
      const ref = doc(db, 'users', uid);
      await setDoc(ref, { bio: draft, updatedAt: Date.now() }, { merge: true });
      setEditing(false);
    }catch(e){ console.error('AboutEditor save', e); }
    setSaving(false);
  }

  if (!isOwner) return null;

  return (
    <div>
      {editing ? (
        <>
          <textarea className="form-control" rows={4} value={draft} onChange={e => setDraft(e.target.value)} />
          <div className="mt-2 d-flex gap-2">
            <Button size="sm" variant="primary" onClick={save} disabled={saving}>Save</Button>
            <Button size="sm" variant="outline-secondary" onClick={() => { setEditing(false); setDraft(bio || ''); }} disabled={saving}>Cancel</Button>
          </div>
        </>
      ) : (
        <div className="text-end"><Button size="sm" variant="link" onClick={() => setEditing(true)}>Edit about</Button></div>
      )}
    </div>
  );
}
