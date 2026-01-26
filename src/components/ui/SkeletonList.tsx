"use client";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ListGroup } from "react-bootstrap";

interface SkeletonListProps {
  items?: number;
  className?: string;
}

export default function SkeletonList({
  items = 5,
  className = "",
}: SkeletonListProps) {
  return (
    <SkeletonTheme
      baseColor="var(--bs-secondary-bg)"
      highlightColor="var(--bs-tertiary-bg)"
    >
      <ListGroup className={className}>
        {Array.from({ length: items }).map((_, index) => (
          <ListGroup.Item key={index}>
            <Skeleton height={20} />
          </ListGroup.Item>
        ))}
      </ListGroup>
    </SkeletonTheme>
  );
}
