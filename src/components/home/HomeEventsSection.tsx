"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getEventGroupsByStatus,
  normalizeRoutePath,
} from "@/components/home/eventGroups";

function formatRouteLabel(title: string): string {
  return title.replace(/Tourney \d+\s*/i, "").trim() || title;
}

const HomeEventsSection: React.FC = () => {
  const groups = useMemo(() => getEventGroupsByStatus("Current"), []);

  if (!groups.length) return null;

  return (
    <section className="mb-12" aria-labelledby="home-events-heading">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-block rounded-full bg-primary-500 px-2.5 py-0.5 text-xs font-semibold uppercase text-white">
            Live Events
          </span>
          <h2
            id="home-events-heading"
            className="mt-2 mb-1 text-lg font-semibold text-foreground"
          >
            Phasmo Tourney Spotlight
          </h2>
          <p className="mb-0 text-sm text-foreground-secondary">
            Track brackets, recorded runs, and stats as matches progress.
          </p>
        </div>
        <Link
          href="/phasmotourney-series"
          className={cn(
            "rounded-md border border-primary-500 px-3 py-1.5 text-sm font-medium text-primary-500",
            "hover:bg-primary-500 hover:text-white transition-colors",
          )}
        >
          Browse all events
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(
          ({ eventTag, displayName, status, primaryRoute, extraRoutes }) => (
            <div
              key={eventTag}
              className="flex h-full flex-col rounded-xl bg-card shadow-sm dark:bg-card-dark"
            >
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase text-foreground-secondary">
                      {eventTag.replace("Phasmo", "Phasmo ")}
                    </p>
                    <h3 className="text-base font-semibold text-foreground">
                      {displayName}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold uppercase text-white",
                      status === "Current" ? "bg-green-600" : "bg-gray-500",
                    )}
                  >
                    {status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="mb-1 text-xs uppercase text-foreground-secondary">
                    Start with
                  </div>
                  <Link
                    href={normalizeRoutePath(primaryRoute.path)}
                    className="font-semibold text-primary-500 no-underline hover:text-primary-600"
                  >
                    {formatRouteLabel(primaryRoute.title)}
                  </Link>
                </div>

                {extraRoutes.length > 0 && (
                  <div className="mb-4 text-sm">
                    <div className="mb-1 text-xs uppercase text-foreground-secondary">
                      Also explore
                    </div>
                    <ul className="mb-0 list-none p-0">
                      {extraRoutes.slice(0, 4).map((route) => (
                        <li key={route.path} className="mb-1">
                          <Link
                            href={normalizeRoutePath(route.path)}
                            className="text-primary-500 no-underline hover:text-primary-600"
                          >
                            {formatRouteLabel(route.title)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  href={normalizeRoutePath(primaryRoute.path)}
                  className={cn(
                    "mt-auto inline-block rounded-md bg-primary-500 px-4 py-2 text-center text-sm font-medium text-white",
                    "hover:bg-primary-600 transition-colors",
                  )}
                >
                  Open {displayName}
                </Link>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
};

export default HomeEventsSection;
