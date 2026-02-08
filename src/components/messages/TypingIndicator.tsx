"use client";

import React from 'react';

interface Props {
  displayName: string;
}

export default function TypingIndicator({ displayName }: Props) {
  return (
    <div className="d-flex align-items-center text-muted small mb-2">
      <span>{displayName} is typing</span>
      <span className="typing-dots ms-1">
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </span>

      <style jsx>{`
        .typing-dots {
          display: inline-flex;
          align-items: center;
        }

        .dot {
          animation: typingDot 1.5s infinite;
          opacity: 0;
        }

        .dot:nth-child(1) {
          animation-delay: 0s;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingDot {
          0%, 60%, 100% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
