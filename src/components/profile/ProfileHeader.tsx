"use client";
import React from 'react';
import Image from 'next/image';
import { Button } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Props {
  uid?: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  createdAt?: number;
  lastSeen?: number;
  signInCount?: number;
}

export default function ProfileHeader({ uid, username, displayName, photoURL, bio, createdAt, lastSeen, signInCount }: Props) {
  const { user } = useAuth();
  const isOwner = !!(user?.uid && uid && user.uid === uid);
  const router = useRouter();

  function toMillis(v?: any){
    if (!v) return null;
    if (typeof v === 'number') return v;
    if (v && typeof v.toMillis === 'function') return v.toMillis();
    if (typeof v === 'string'){
      const p = Date.parse(v); if (!Number.isNaN(p)) return p;
    }
    return null;
  }

  const ms = toMillis(createdAt as any);
  const memberSince = ms ? new Date(ms).toLocaleDateString() : null;
  const lastSeenMs = toMillis(lastSeen as any) || null;

  return (
    <div className="card mb-4">
      <div className="card-body d-flex flex-column flex-md-row align-items-start">
        <div className="me-3" style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: '#e9ecef', position: 'relative' }}>
          {photoURL ? (
            <Image src={photoURL} alt="avatar" fill style={{ objectFit: 'cover' }} sizes="96px" />
          ) : (
            <div style={{ width: '100%', height: '100%' }} />
          )}
        </div>

        <div className="flex-grow-1 w-100">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0">{displayName || username}</h2>
              <div className="text-muted">@{username}</div>
            </div>
            <div className="d-flex gap-2">
              {isOwner ? (
                <>
                  <Button variant="outline-secondary" size="sm" onClick={() => router.push('/account')}>Edit Profile</Button>
                  <Button variant="primary" size="sm" onClick={() => router.push('/account')}>Change Username</Button>
                </>
              ) : (
                <>
                  <Button variant="outline-primary" size="sm">Add Friend</Button>
                  <Button variant="primary" size="sm" disabled title="DMs are friends-only">Message</Button>
                </>
              )}
            </div>
          </div>

          {bio ? <p className="mt-3 mb-1">{bio}</p> : null}

          <div className="d-flex gap-3 text-muted mt-2 small">
            <div><strong>0</strong> posts</div>
            <div><strong>0</strong> followers</div>
            <div><strong>0</strong> following</div>
            {memberSince && <div>Member since {memberSince}</div>}
            {lastSeenMs && <div>Last seen {new Date(lastSeenMs).toLocaleString()}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
