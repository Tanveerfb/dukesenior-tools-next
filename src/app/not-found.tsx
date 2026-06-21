import Link from "next/link";
import { FiHome, FiSearch } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-6">
      <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        404
      </h1>

      <h2 className="text-2xl md:text-3xl font-semibold text-foreground dark:text-foreground-dark">
        Page Not Found
      </h2>

      <p className="text-foreground-muted dark:text-foreground-dark-muted max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-primary hover:bg-primary-600 text-white rounded-lg transition-all hover:-translate-y-0.5 no-underline"
        >
          <FiHome size={16} />
          Return Home
        </Link>
        <Link
          href="/phasmotourney-series"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-border dark:border-border-dark text-foreground dark:text-foreground-dark rounded-lg hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-all hover:-translate-y-0.5 no-underline"
        >
          <FiSearch size={16} />
          Browse Tourneys
        </Link>
      </div>
    </div>
  );
}
