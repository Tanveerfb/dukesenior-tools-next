"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  getEventGroupsByStatus,
  normalizeRoutePath,
} from "@/components/home/eventGroups";

const HomeHero = () => {
  const [activeEvent] = getEventGroupsByStatus("Current");

  // Only show hero when at least one current event exists
  if (!activeEvent) return null;

  const primaryHref = normalizeRoutePath(activeEvent.primaryRoute.path);
  const secondary = activeEvent.extraRoutes[0];

  // Resolve special quick links for Tourney 5 when current
  const tourney5Links: { title: string; href: string }[] = [];
  if (activeEvent && activeEvent.eventTag === "PhasmoTourney5") {
    // Map manifest entries to required quick links
    const linkMap: { tag: string; title: string }[] = [
      { tag: "Timeline", title: "Timeline" },
      { tag: "Next", title: "What's Next?" },
      { tag: "Videos", title: "Videos & Streams" },
      { tag: "Rules", title: "Rules & Settings" },
    ];
    linkMap.forEach(({ tag, title }) => {
      const route = activeEvent.routes.find((r) => r.tags.includes(tag));
      if (route) {
        tourney5Links.push({
          title,
          href: normalizeRoutePath(route.path),
        });
      }
    });
  }

  return (
    <section
      className="border-b border-border dark:border-border-dark"
      style={{
        background:
          "linear-gradient(135deg, var(--color-bg-card, #fff) 0%, rgba(13,110,253,.08) 50%, var(--color-bg-card, #fff) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block rounded-full bg-primary-500 px-2.5 py-0.5 text-xs font-semibold uppercase text-white">
                Now Live
              </span>
            </motion.div>
            <div className="mt-3">
              <div>
                <motion.h1
                  className="mb-2 text-3xl font-semibold text-foreground md:text-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {activeEvent.displayName}
                </motion.h1>
                <motion.p
                  className="mb-4 text-foreground-secondary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Brackets, recorded runs, settings, and streams — all in one
                  place.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex flex-wrap gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={primaryHref}
                        className={cn(
                          "inline-block rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white",
                          "hover:bg-primary-600 transition-colors",
                        )}
                      >
                        Open {activeEvent.displayName}
                      </Link>
                    </motion.div>
                    {secondary && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href={normalizeRoutePath(secondary.path)}
                          className={cn(
                            "inline-block rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground",
                            "hover:bg-gray-100 dark:border-border-dark dark:hover:bg-gray-800 transition-colors",
                          )}
                        >
                          {secondary.title}
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex h-full flex-col rounded-xl bg-card p-4 shadow-sm dark:bg-card-dark">
                <p className="mb-2 text-xs font-medium uppercase text-foreground-secondary">
                  Quick links
                </p>
                {tourney5Links.length > 0 ? (
                  <div className="mb-3 flex flex-col gap-2">
                    {tourney5Links.map((l, idx) => (
                      <motion.div
                        key={l.href}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <Link
                          href={l.href}
                          className={cn(
                            "block rounded-md bg-gray-100 px-3 py-2 text-left text-sm font-medium text-foreground",
                            "hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors",
                          )}
                        >
                          {l.title}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <ul className="mb-4 list-none p-0 text-sm">
                    <li className="mb-1">
                      <Link
                        href={primaryHref}
                        className="font-semibold text-primary-500 no-underline hover:text-primary-600"
                      >
                        {activeEvent.primaryRoute.title}
                      </Link>
                    </li>
                    {activeEvent.extraRoutes.slice(0, 2).map((route) => (
                      <li key={route.path} className="mb-1">
                        <Link
                          href={normalizeRoutePath(route.path)}
                          className="text-primary-500 no-underline hover:text-primary-600"
                        >
                          {route.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href="https://twitch.tv/DukeSenior"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-auto inline-block rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground",
                      "hover:bg-gray-100 dark:border-border-dark dark:hover:bg-gray-800 transition-colors",
                    )}
                  >
                    Watch on Twitch
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HomeHero;
