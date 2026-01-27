"use client";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { List, ListItem, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface SkeletonListProps {
  items?: number;
  className?: string;
}

export default function SkeletonList({
  items = 5,
  className = "",
}: SkeletonListProps) {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.palette.action.hover}
      highlightColor={theme.palette.action.selected}
    >
      <Paper className={className}>
        <List>
          {Array.from({ length: items }).map((_, index) => (
            <ListItem key={index}>
              <Skeleton height={20} width="100%" />
            </ListItem>
          ))}
        </List>
      </Paper>
    </SkeletonTheme>
  );
}
