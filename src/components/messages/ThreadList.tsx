"use client";

import React, { useState, useMemo } from 'react';
import { Badge, Form, Spinner } from 'react-bootstrap';
import UserAvatar from '@/components/user/UserAvatar';
import type { DMThread } from '@/types/messages';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Props {
  threads: DMThread[];
  activeThreadId?: string;
  currentUserId: string;
  onSelectThread: (threadId: string) => void;
  loading?: boolean;
}

/**
 * Format timestamp as relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return `${days}d ago`;
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ThreadList({
  threads,
  activeThreadId,
  currentUserId,
  onSelectThread,
  loading = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter threads by username
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) {
      return threads;
    }

    const query = searchQuery.toLowerCase();
    return threads.filter((thread) => {
      const otherUserId = thread.participants.find((uid) => uid !== currentUserId);
      if (!otherUserId) return false;

      const otherUser = thread.participantDetails?.[otherUserId];
      if (!otherUser) return false;

      return (
        otherUser.username.toLowerCase().includes(query) ||
        otherUser.displayName.toLowerCase().includes(query)
      );
    });
  }, [threads, searchQuery, currentUserId]);

  if (loading) {
    return (
      <div className="p-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mb-3">
            <div className="d-flex align-items-center">
              <Skeleton circle width={48} height={48} />
              <div className="ms-3 flex-grow-1">
                <Skeleton width={120} height={16} />
                <Skeleton width={180} height={14} className="mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-100 d-flex flex-column">
      {/* Search bar */}
      <div className="p-3 border-bottom">
        <Form.Control
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="sm"
        />
      </div>

      {/* Thread list */}
      <div className="flex-grow-1 overflow-auto">
        {filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-muted">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const otherUserId = thread.participants.find((uid) => uid !== currentUserId);
            if (!otherUserId) return null;

            const otherUser = thread.participantDetails?.[otherUserId];
            if (!otherUser) return null;

            const unreadCount = thread.unreadCount?.[currentUserId] || 0;
            const isActive = thread.id === activeThreadId;

            return (
              <div
                key={thread.id}
                className={`thread-item p-3 border-bottom ${isActive ? 'active' : ''}`}
                onClick={() => onSelectThread(thread.id)}
                style={{
                  cursor: 'pointer',
                  background: isActive ? '#f0f0f0' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f8f8f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div className="d-flex align-items-center">
                  {/* Avatar with accent color border */}
                  <div
                    style={{
                      border: otherUser.accentColor
                        ? `2px solid ${otherUser.accentColor}`
                        : '2px solid #ccc',
                      borderRadius: '50%',
                      padding: 2,
                    }}
                  >
                    <UserAvatar
                      user={{
                        ...otherUser,
                        uid: otherUserId,
                      }}
                      size="medium"
                    />
                  </div>

                  {/* Thread info */}
                  <div className="ms-3 flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-bold text-truncate">
                          {otherUser.displayName}
                        </div>
                        <div className="text-muted small text-truncate">
                          @{otherUser.username}
                        </div>
                      </div>

                      {/* Timestamp and unread badge */}
                      <div className="ms-2 text-end flex-shrink-0">
                        {thread.lastMessageAt && (
                          <div className="small text-muted">
                            {formatRelativeTime(thread.lastMessageAt)}
                          </div>
                        )}
                        {unreadCount > 0 && (
                          <Badge
                            bg="danger"
                            pill
                            className="mt-1"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Last message preview */}
                    {thread.lastMessage && (
                      <div
                        className="text-muted small text-truncate mt-1"
                        style={{ maxWidth: '100%' }}
                      >
                        {thread.lastMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
