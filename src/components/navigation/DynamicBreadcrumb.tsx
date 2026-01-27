"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box, Breadcrumbs, Typography, Link as MuiLink, Container } from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function pathToBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  segments.forEach((segment, index) => {
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const href = "/" + segments.slice(0, index + 1).join("/");
    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
}

const MotionBox = motion(Box);

export default function DynamicBreadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumbs on home page
  if (pathname === "/") return null;

  const breadcrumbs = pathToBreadcrumbs(pathname);

  // Only show if we have meaningful breadcrumbs (more than just Home)
  if (breadcrumbs.length <= 1) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        bgcolor: "action.hover",
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={crumb.label} color="text.primary" fontSize="0.875rem">
                {crumb.label}
              </Typography>
            ) : (
              <MuiLink
                key={crumb.href}
                component={Link}
                href={crumb.href!}
                color="inherit"
                underline="hover"
                fontSize="0.875rem"
                sx={{
                  transition: "color 0.2s",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                {crumb.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      </Container>
    </MotionBox>
  );
}
