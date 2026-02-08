"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Form, Dropdown, Spinner } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';
import UserAvatar from '@/components/user/UserAvatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import type { DMThread, DMMessage } from '@/types/messages';
import type { UserDoc } from '@/lib/services/users';
import {
  listenToThread,
  sendMessage,
  markThreadAsRead,
  setTyping,
  listenToTyping,
} from '@/lib/services/messages';
import { areFriends, isBlocked } from '@/lib/services/friends';

interface Props {
  thread: DMThread;
  currentUser: UserDoc;
  otherUser: Partial<UserDoc>;
  onBlock?: () => void;
  onArchive?: () => void;
}

export default function ChatWindow({
  thread,
  currentUser,
  otherUser,
  onBlock,
  onArchive,
}: Props) {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [canMessage, setCanMessage] = useState(true);
  const [blockStatus, setBlockStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollHeight = useRef<number>(0);

  // Check if users are still friends and not blocked
  useEffect(() => {
    if (!currentUser.uid || !otherUser.uid) return;

    async function checkStatus() {
      try {
        const [friends, blocked1, blocked2] = await Promise.all([
          areFriends(currentUser.uid, otherUser.uid!),
          isBlocked(currentUser.uid, otherUser.uid!),
          isBlocked(otherUser.uid!, currentUser.uid),
        ]);

        if (!friends) {
          setCanMessage(false);
          setBlockStatus('You are no longer friends with this user');
        } else if (blocked1) {
          setCanMessage(false);
          setBlockStatus('You have blocked this user');
        } else if (blocked2) {
          setCanMessage(false);
          setBlockStatus('This user has blocked you');
        } else {
          setCanMessage(true);
          setBlockStatus(null);
        }
      } catch (error) {
        console.error('Error checking friendship status:', error);
      }
    }

    checkStatus();
  }, [currentUser.uid, otherUser.uid, thread.id]);

  // Listen to messages
  useEffect(() => {
    if (!thread.id) return;

    setLoading(true);
    const unsubscribe = listenToThread(thread.id, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [thread.id]);

  // Listen to typing indicators
  useEffect(() => {
    if (!thread.id || !currentUser.uid) return;

    const unsubscribe = listenToTyping(thread.id, currentUser.uid, (indicators) => {
      const typingUserIds = indicators.map((i) => i.uid);
      setTypingUsers(typingUserIds);
    });

    return () => unsubscribe();
  }, [thread.id, currentUser.uid]);

  // Mark messages as read when thread is opened
  useEffect(() => {
    if (!thread.id || !currentUser.uid) return;

    markThreadAsRead(thread.id, currentUser.uid).catch((error) => {
      console.error('Error marking thread as read:', error);
    });
  }, [thread.id, currentUser.uid]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user was near bottom before new messages arrived
    const wasNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (wasNearBottom || messages.length <= 1) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!thread.id || !currentUser.uid) return;

    // Send typing indicator
    setTyping(thread.id, currentUser.uid, true).catch((error) => {
      console.error('Error setting typing:', error);
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(thread.id, currentUser.uid, false).catch((error) => {
        console.error('Error clearing typing:', error);
      });
    }, 3000);
  }, [thread.id, currentUser.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || sending || !canMessage) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (thread.id && currentUser.uid) {
      await setTyping(thread.id, currentUser.uid, false).catch(() => {});
    }

    try {
      await sendMessage(thread.id, currentUser.uid, otherUser.uid!, content);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message');
      setMessageInput(content); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setMessageInput(value);
      handleTyping();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, DMMessage[]>);

  const formatDateSeparator = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="h-100 d-flex flex-column">
      {/* Header */}
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <UserAvatar user={otherUser} size="medium" showStatus />
          <div className="ms-3">
            <div className="fw-bold">{otherUser.displayName}</div>
            <div className="text-muted small">@{otherUser.username}</div>
          </div>
        </div>

        <Dropdown>
          <Dropdown.Toggle size="sm" variant="outline-secondary">
            •••
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            {onArchive && <Dropdown.Item onClick={onArchive}>Archive</Dropdown.Item>}
            {onBlock && <Dropdown.Item onClick={onBlock}>Block User</Dropdown.Item>}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Status warning */}
      {blockStatus && (
        <div className="alert alert-warning m-3 mb-0">
          {blockStatus}
        </div>
      )}

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-grow-1 overflow-auto p-3"
        style={{ background: '#fafafa' }}
      >
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted py-5">
            No messages yet. Say hi! 👋
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([dateString, msgs]) => (
              <div key={dateString}>
                {/* Date separator */}
                <div className="text-center my-3">
                  <span
                    className="badge bg-secondary"
                    style={{ fontSize: '0.75rem', fontWeight: 'normal' }}
                  >
                    {formatDateSeparator(dateString)}
                  </span>
                </div>

                {/* Messages */}
                {msgs.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.from === currentUser.uid}
                    sender={
                      message.from === currentUser.uid
                        ? currentUser
                        : otherUser
                    }
                    showAvatar
                  />
                ))}
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator displayName={otherUser.displayName || otherUser.username || 'User'} />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="p-3 border-top">
        <Form onSubmit={handleSendMessage}>
          <div className="d-flex gap-2">
            <Form.Control
              as="textarea"
              rows={1}
              placeholder={
                canMessage
                  ? 'Type a message... (Shift+Enter for new line)'
                  : 'Cannot send messages'
              }
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={sending || !canMessage}
              style={{
                resize: 'none',
                maxHeight: 120,
                overflowY: 'auto',
              }}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!messageInput.trim() || sending || !canMessage}
              style={{
                background: currentUser.accentColor || '#5865F2',
                borderColor: currentUser.accentColor || '#5865F2',
              }}
            >
              {sending ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}
            </Button>
          </div>
          <div className="text-end mt-1">
            <small className="text-muted">
              {messageInput.length} / 2000
            </small>
          </div>
        </Form>
      </div>
    </div>
  );
}
