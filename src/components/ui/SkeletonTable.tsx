"use client";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export default function SkeletonTable({
  rows = 5,
  columns = 4,
  className = "",
}: SkeletonTableProps) {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.palette.action.hover}
      highlightColor={theme.palette.action.selected}
    >
      <Paper className={className} sx={{ width: "100%", overflow: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton height={16} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </SkeletonTheme>
  );
}
