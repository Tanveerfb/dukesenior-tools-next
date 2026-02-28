"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiHome, FiRefreshCw } from "react-icons/fi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-6">
      <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Oops!
      </h1>

      <h2 className="text-2xl md:text-3xl font-semibold text-foreground dark:text-foreground-dark">
        Something went wrong
      </h2>

      <p className="text-foreground-muted dark:text-foreground-dark-muted max-w-md">
        We encountered an unexpected error. Don&apos;t worry, our team has been
        notified and is working on it.
      </p>

      {error.digest && (
        <p className="text-xs font-mono text-foreground-muted/60 dark:text-foreground-dark-muted/60">
          Error ID: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-primary hover:bg-primary-600 text-white rounded-lg transition-all hover:-translate-y-0.5"
        >
          <FiRefreshCw size={16} />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-border dark:border-border-dark text-foreground dark:text-foreground-dark rounded-lg hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-all hover:-translate-y-0.5 no-underline"
        >
          <FiHome size={16} />
          Return Home
        </Link>
      </div>
    </div>
  );
}
