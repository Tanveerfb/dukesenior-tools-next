"use client";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, CardContent } from "@mui/material";
import { useTheme } from "@mui/material/styles";

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
  const theme = useTheme();
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={className} sx={{ mb: 2 }}>
          <CardContent>
            <SkeletonTheme
              baseColor={theme.palette.action.hover}
              highlightColor={theme.palette.action.selected}
            >
              <Skeleton height={24} width="60%" style={{ marginBottom: 8 }} />
              <Skeleton count={3} />
              {showButton && (
                <Skeleton height={40} width={120} style={{ marginTop: 16 }} />
              )}
            </SkeletonTheme>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
