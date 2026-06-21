"use client";
import { motion } from "framer-motion";
import {
  FiThumbsUp,
  FiPlayCircle,
  FiAward,
  FiShield,
  FiFileText,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "vote" | "run" | "tournament" | "admin" | "post";
  user: string;
  action: string;
  timestamp: string;
  metadata?: string;
}

// currently there is no live activity feed, so we display placeholder
// text. once a real feed API is available we can fetch and render data here.
const sampleActivities: Activity[] = [];

const activityConfig: Record<
  Activity["type"],
  { icon: React.ReactNode; colorClass: string; bgClass: string }
> = {
  vote: {
    icon: <FiThumbsUp size={16} />,
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
  run: {
    icon: <FiPlayCircle size={16} />,
    colorClass: "text-info",
    bgClass: "bg-info/10",
  },
  tournament: {
    icon: <FiAward size={16} />,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
  },
  admin: {
    icon: <FiShield size={16} />,
    colorClass: "text-danger",
    bgClass: "bg-danger/10",
  },
  post: {
    icon: <FiFileText size={16} />,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
};

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-5"
    >
      <h2 className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-1">
        Recent Activity
      </h2>
      <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted mb-4">
        Latest updates from the community
      </p>

      <div className="space-y-0">
        {sampleActivities.length === 0 ? (
          <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted">
            Recent activity will appear here once the feature is live.
          </p>
        ) : (
          sampleActivities.map((activity, index) => {
            const config = activityConfig[activity.type];
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "flex items-start gap-3 py-3",
                  index < sampleActivities.length - 1 &&
                    "border-b border-border dark:border-border-dark",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                    config.bgClass,
                    config.colorClass,
                  )}
                >
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground dark:text-foreground-dark">
                      {activity.user}
                    </span>{" "}
                    <span className="text-foreground-muted dark:text-foreground-dark-muted">
                      {activity.action}
                    </span>
                  </p>
                  {activity.metadata && (
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-foreground-muted dark:text-foreground-dark-muted mt-1">
                      {activity.metadata}
                    </span>
                  )}
                  <p className="text-xs text-foreground-muted/70 dark:text-foreground-dark-muted/70 mt-0.5">
                    {activity.timestamp}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
