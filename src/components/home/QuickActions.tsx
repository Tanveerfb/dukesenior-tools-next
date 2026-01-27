"use client";
import { Card, CardContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  Feedback as FeedbackIcon,
  LibraryBooks as LibraryIcon,
  Info as InfoIcon,
  VideoLibrary as VideoIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const MotionCard = motion.create(Card);
const MotionListItem = motion.create(ListItem);

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}

const quickActions: QuickAction[] = [
  {
    icon: <PersonIcon />,
    label: "Your Profile",
    description: "View and edit your profile",
    href: "/profile",
  },
  {
    icon: <TrophyIcon />,
    label: "Leaderboards",
    description: "See tournament standings",
    href: "/phasmotourney-series",
  },
  {
    icon: <VideoIcon />,
    label: "Recorded Runs",
    description: "Browse match recordings",
    // Note: Both link to the tournament series page where users can navigate to specific sections
    href: "/phasmotourney-series",
  },
  {
    icon: <FeedbackIcon />,
    label: "Suggestions",
    description: "Share ideas & feedback",
    href: "/suggestions",
  },
  {
    icon: <LibraryIcon />,
    label: "Resources",
    description: "Guides and documentation",
    href: "/posts",
  },
  {
    icon: <InfoIcon />,
    label: "About",
    description: "Learn more about us",
    href: "/about",
  },
];

export default function QuickActions() {
  const theme = useTheme();

  return (
    <MotionCard
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      elevation={2}
      sx={{
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Navigate to key pages and features
        </Typography>

        <List sx={{ p: 0 }}>
          {quickActions.map((action, index) => (
            <MotionListItem
              key={action.href}
              disablePadding
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ListItemButton
                component={Link}
                href={action.href}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&:hover": {
                    bgcolor: theme.palette.mode === "dark" ? "rgba(171, 47, 177, 0.1)" : "rgba(171, 47, 177, 0.05)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: 40 }}>
                  {action.icon}
                </ListItemIcon>
                <ListItemText
                  primary={action.label}
                  secondary={action.description}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                  }}
                  secondaryTypographyProps={{
                    variant: "caption",
                  }}
                />
              </ListItemButton>
            </MotionListItem>
          ))}
        </List>
      </CardContent>
    </MotionCard>
  );
}
