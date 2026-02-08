"use client";

import React, { useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import UserAvatar from '@/components/user/UserAvatar';
import type { DMMessage } from '@/types/messages';
import type { UserDoc } from '@/lib/services/users';

interface Props {
  message: DMMessage;
  isOwn: boolean;
  sender?: Partial<UserDoc>;
  showAvatar?: boolean;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Same day: "10:30 AM"
  if (days === 0 && date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // Yesterday: "Yesterday at 10:30 AM"
  if (days === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  // This week: "Monday at 10:30 AM"
  if (days < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  // Older: "Jan 15 at 10:30 AM"
  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} at ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

/**
 * Full datetime for tooltip
 */
function formatFullTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function MessageBubble({
  message,
  isOwn,
  sender,
  showAvatar = true,
}: Props) {
  const [showTime, setShowTime] = useState(false);

  const handleDoubleClick = () => {
    if (!message.deleted) {
      navigator.clipboard.writeText(message.content);
    }
  };

  const bgColor = isOwn
    ? sender?.accentColor
      ? `${sender.accentColor}1A` // 10% opacity
      : '#5865F21A'
    : '#F2F3F5';

  const textColor = message.deleted ? '#888' : 'inherit';
  const fontStyle = message.deleted ? 'italic' : 'normal';

  return (
    <div
      className={`d-flex mb-3 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
    >
      {!isOwn && showAvatar && (
        <div className="me-2" style={{ width: 32, height: 32, flexShrink: 0 }}>
          <UserAvatar user={sender} size="small" />
        </div>
      )}

      <div style={{ maxWidth: '70%' }}>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-${message.id}`}>
              {formatFullTimestamp(message.createdAt)}
            </Tooltip>
          }
        >
          <div
            className="p-3"
            style={{
              background: bgColor,
              borderRadius: 16,
              cursor: message.deleted ? 'default' : 'pointer',
              color: textColor,
              fontStyle,
              wordBreak: 'break-word',
            }}
            onDoubleClick={handleDoubleClick}
            onMouseEnter={() => setShowTime(true)}
            onMouseLeave={() => setShowTime(false)}
          >
            {message.type === 'image' ? (
              <img
                src={message.content}
                alt="Sent image"
                style={{ maxWidth: '100%', borderRadius: 8 }}
              />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </div>
            )}

            {message.editedAt && !message.deleted && (
              <div className="text-muted small mt-1">(edited)</div>
            )}
          </div>
        </OverlayTrigger>

        {showTime && (
          <div
            className={`small text-muted mt-1 ${isOwn ? 'text-end' : 'text-start'}`}
          >
            {formatTimestamp(message.createdAt)}
          </div>
        )}
      </div>

      {isOwn && showAvatar && (
        <div className="ms-2" style={{ width: 32, height: 32, flexShrink: 0 }}>
          <UserAvatar user={sender} size="small" />
        </div>
      )}
    </div>
  );
}
