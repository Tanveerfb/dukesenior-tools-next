"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Card } from "react-bootstrap";

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
    >
      <Card className={`border-0 text-center empty-state ${className}`}>
        <Card.Body className="py-5">
          {icon && <div className="empty-state-icon mb-3">{icon}</div>}
          <h3 className="h5 fw-semibold mb-2">{title}</h3>
          {description && (
            <p className="text-muted mb-4">{description}</p>
          )}
          {action && <div className="mt-3">{action}</div>}
        </Card.Body>
      </Card>
    </motion.div>
  );
}
