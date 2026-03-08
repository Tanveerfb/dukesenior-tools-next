"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b-2 border-dashed border-border dark:border-border-dark">
      {/* Animated background shape */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -top-[20%] -right-[10%] w-1/2 h-[140%] bg-[radial-gradient(circle,var(--marker-orange)_0%,transparent_70%)] rounded-full pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="flex flex-col items-center text-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 rounded-md border-2 border-dashed border-primary/40 bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider -tilt-sm">
              The Lair of Evil
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl text-foreground dark:text-foreground-dark chalk-underline"
          >
            Community Hub & Utility Toolkit
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-base md:text-lg text-foreground-muted dark:text-foreground-dark-muted"
          >
            Everything you need from profiles and leaderboards to resources and
            community discussion — neatly bundled for easy access.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium bg-primary hover:bg-primary-600 text-white rounded-md border-2 border-primary-700/30 transition-all hover:scale-105 active:scale-95 no-underline shadow-soft tilt-sm"
            >
              View Leaderboard
            </Link>
            <Link
              href="/suggestions"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium border-2 border-dashed border-border dark:border-border-dark text-foreground dark:text-foreground-dark rounded-md hover:bg-card/60 dark:hover:bg-card-dark/60 transition-all hover:scale-105 active:scale-95 no-underline -tilt-sm"
            >
              Give Feedback
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
