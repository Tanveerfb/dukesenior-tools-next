"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiUser,
  FiUsers,
  FiAward,
  FiPlayCircle,
  FiMessageCircle,
  FiBookOpen,
  FiInfo,
} from "react-icons/fi";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}

const quickActions: QuickAction[] = [
  {
    icon: <FiUser size={18} />,
    label: "Your Profile",
    description: "View and edit your profile",
    href: "/profile",
  },
  {
    icon: <FiUsers size={18} />,
    label: "Friends",
    description: "Manage your friends list",
    href: "/friends",
  },
  {
    icon: <FiAward size={18} />,
    label: "Leaderboard",
    description: "See top users",
    href: "/leaderboard",
  },
  {
    icon: <FiMessageCircle size={18} />,
    label: "Suggestions",
    description: "Share ideas & feedback",
    href: "/suggestions",
  },
  {
    icon: <FiBookOpen size={18} />,
    label: "Resources",
    description: "Guides, posts, and documentation",
    href: "/posts",
  },
  {
    icon: <FiInfo size={18} />,
    label: "About",
    description: "Learn more about the site",
    href: "/about",
  },
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-5"
    >
      <h2 className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-1">
        Quick Actions
      </h2>
      <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted mb-4">
        Navigate to key pages and features
      </p>

      <div className="space-y-1">
        {quickActions.map((action, index) => (
          <motion.div
            key={`${action.href}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={action.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors no-underline group"
            >
              <span className="text-primary shrink-0">{action.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground dark:text-foreground-dark group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-foreground-muted dark:text-foreground-dark-muted">
                  {action.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
