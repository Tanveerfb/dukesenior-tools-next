"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl text-center bg-card dark:bg-card-dark border border-border dark:border-border-dark",
        className,
      )}
    >
      <div className="py-12 px-6">
        {icon && (
          <div className="text-5xl opacity-50 mb-4 flex justify-center">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted mb-6">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </motion.div>
  );
}
