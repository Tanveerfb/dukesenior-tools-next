"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import { HiOutlineArrowNarrowRight } from "react-icons/hi";

const quickLinks = [
  {
    title: "Event hub",
    href: "/phasmotourney-series",
    description:
      "Browse brackets, stats, and match history across every tourney.",
  },
  {
    title: "Community suggestions",
    href: "/suggestions",
    description: "Share ideas, report issues, and vote on what ships next.",
  },
];

const HomeSidebar = () => {
  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="rounded-xl bg-card p-4 shadow-sm dark:bg-card-dark">
          <h3 className="mb-2 text-base font-semibold text-foreground">
            Stay connected
          </h3>
          <p className="mb-3 text-sm text-foreground-secondary">
            Coordinate with staff, players, and community members across the
            DukeSenior network.
          </p>
          <div className="flex flex-col gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a
                href="https://discord.gg/xB9mpZfbq3"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground",
                  "hover:bg-gray-100 dark:border-border-dark dark:hover:bg-gray-800 transition-colors",
                )}
              >
                <FaDiscord /> The Lair of Evil
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a
                href="https://discord.gg/r9WT8RUPxn"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground",
                  "hover:bg-gray-100 dark:border-border-dark dark:hover:bg-gray-800 transition-colors",
                )}
              >
                <FaDiscord /> Phasmo Tourney
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="rounded-xl bg-card p-4 shadow-sm dark:bg-card-dark">
          <h3 className="mb-2 text-base font-semibold text-foreground">
            Quick links
          </h3>
          <p className="mb-3 text-sm text-foreground-secondary">
            Jump straight to the tools that keep events running smoothly.
          </p>
          <div className="text-sm">
            {quickLinks.map((link, idx) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start justify-between gap-3 py-2">
                  <div>
                    <Link
                      href={link.href}
                      className="block font-semibold text-primary-500 no-underline hover:text-primary-600"
                    >
                      {link.title}
                    </Link>
                    <span className="text-foreground-secondary">
                      {link.description}
                    </span>
                  </div>
                  <HiOutlineArrowNarrowRight className="mt-1 shrink-0 text-foreground-secondary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeSidebar;
