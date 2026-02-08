"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import ThreadList from '@/components/messages/ThreadList';
import ChatWindow from '@/components/messages/ChatWindow';
import type { DMThread } from '@/types/messages';
import { listenToThreads, createOrGetThread, generateThreadId } from '@/lib/services/messages';
import { getUserByUsername, getUserByUID } from '@/lib/services/users';
import { blockUser } from '@/lib/services/friends';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [threads, setThreads] = useState<DMThread[]>([]);
  const [activeThread, setActiveThread] = useState<DMThread | null>(null);
  const [loading, setLoading] = useState(true);

  // Get username from URL params if present (e.g., /messages?username=john)
  const usernameParam = searchParams?.get('username');

  // Listen to threads for current user
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenToThreads(user.uid, (updatedThreads) => {
      setThreads(updatedThreads);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Handle username param - create or open thread with that user
  useEffect(() => {
    if (!user?.uid || !usernameParam) return;

    async function openThreadWithUser() {
      try {
        const targetUser = await getUserByUsername(usernameParam);
        if (!targetUser) {
          alert(`User @${usernameParam} not found`);
          router.push('/messages');
          return;
        }

        const thread = await createOrGetThread(user.uid, targetUser.uid);
        setActiveThread(thread);

        // Clear URL param
        router.replace('/messages', { scroll: false });
      } catch (error: any) {
        console.error('Error opening thread:', error);
        alert(error.message || 'Failed to open conversation');
        router.push('/messages');
      }
    }

    openThreadWithUser();
  }, [user?.uid, usernameParam, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/messages');
    }
  }, [user, authLoading, router]);

  const handleSelectThread = async (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      setActiveThread(thread);
    }
  };

  const handleBlock = async () => {
    if (!user || !activeThread) return;

    const otherUserId = activeThread.participants.find((uid) => uid !== user.uid);
    if (!otherUserId) return;

    const otherUser = activeThread.participantDetails?.[otherUserId];
    if (!otherUser) return;

    if (
      !confirm(
        `Block @${otherUser.username}? This will remove them from your friends and prevent future interactions.`
      )
    ) {
      return;
    }

    try {
      await blockUser(user.uid, otherUserId, otherUser.username);
      alert(`Blocked @${otherUser.username}`);
      setActiveThread(null);
      router.push('/messages');
    } catch (error: any) {
      console.error('Error blocking user:', error);
      alert(error.message || 'Failed to block user');
    }
  };

  if (authLoading || !user) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  // Get other user details for active thread
  const otherUserId = activeThread?.participants.find((uid) => uid !== user.uid);
  const otherUser = otherUserId
    ? activeThread?.participantDetails?.[otherUserId]
    : null;

  return (
    <Container fluid className="py-3" style={{ height: 'calc(100vh - 100px)' }}>
      <Row className="h-100">
        {/* Thread List - Mobile: Full width when no active thread, Desktop: Fixed width */}
        <Col
          xs={12}
          md={4}
          lg={3}
          className={`h-100 border-end ${activeThread ? 'd-none d-md-block' : ''}`}
          style={{ maxWidth: '300px' }}
        >
          <div className="h-100 bg-white rounded shadow-sm">
            <ThreadList
              threads={threads}
              activeThreadId={activeThread?.id}
              currentUserId={user.uid}
              onSelectThread={handleSelectThread}
              loading={loading}
            />
          </div>
        </Col>

        {/* Chat Window */}
        <Col
          xs={12}
          md={8}
          lg={9}
          className={`h-100 ${!activeThread ? 'd-none d-md-block' : ''}`}
        >
          <div className="h-100 bg-white rounded shadow-sm">
            {activeThread && otherUser ? (
              <ChatWindow
                thread={activeThread}
                currentUser={user}
                otherUser={{
                  ...otherUser,
                  uid: otherUserId,
                }}
                onBlock={handleBlock}
              />
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                {threads.length === 0 ? (
                  <div className="text-center">
                    <h4>No messages yet</h4>
                    <p>Add friends to start chatting!</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <h4>Select a conversation</h4>
                    <p>Choose a friend from the list to start messaging</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Mobile: Back button when thread is active */}
      {activeThread && (
        <div className="d-md-none position-fixed bottom-0 start-0 p-3">
          <button
            className="btn btn-secondary"
            onClick={() => setActiveThread(null)}
          >
            ← Back to conversations
          </button>
        </div>
      )}
    </Container>
  );
}
