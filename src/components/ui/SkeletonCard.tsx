"use client";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card } from "react-bootstrap";

interface SkeletonCardProps {
  count?: number;
  showButton?: boolean;
  className?: string;
}

export default function SkeletonCard({
  count = 1,
  showButton = true,
  className = "",
}: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={`p-3 ${className}`}>
          <Card.Body>
            <SkeletonTheme
              baseColor="var(--bs-secondary-bg)"
              highlightColor="var(--bs-tertiary-bg)"
            >
              <Skeleton height={24} width="60%" className="mb-2" />
              <Skeleton count={3} />
              {showButton && (
                <Skeleton height={40} width={120} className="mt-3" />
              )}
            </SkeletonTheme>
          </Card.Body>
        </Card>
      ))}
    </>
  );
}
