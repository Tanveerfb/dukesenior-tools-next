"use client";
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTheme, type Theme } from "@mui/material/styles";
import {
  ThumbUp as ThumbUpIcon,
  VideoLibrary as VideoIcon,
  EmojiEvents as TrophyIcon,
  AdminPanelSettings as AdminIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";

const MotionCard = motion.create(Card);
const MotionListItem = motion.create(ListItem);

interface Activity {
  id: string;
  type: "vote" | "run" | "tournament" | "admin" | "post";
  user: string;
  action: string;
  timestamp: string;
  metadata?: string;
}

// Sample activities - in a real app, these would come from an API
const sampleActivities: Activity[] = [
  {
    id: "1",
    type: "post",
    user: "DukeSenior",
    action: "published a new guide",
    timestamp: "2 hours ago",
    metadata: "Advanced Strategies",
  },
  {
    id: "2",
    type: "run",
    user: "PlayerOne",
    action: "recorded a new run",
    timestamp: "4 hours ago",
    metadata: "Perfect Score: 100",
  },
  {
    id: "3",
    type: "tournament",
    user: "System",
    action: "Tourney 5 registration opened",
    timestamp: "5 hours ago",
  },
  {
    id: "4",
    type: "vote",
    user: "PlayerTwo",
    action: "voted on a suggestion",
    timestamp: "6 hours ago",
    metadata: "Custom Difficulty",
  },
  {
    id: "5",
    type: "admin",
    user: "AdminUser",
    action: "updated tournament settings",
    timestamp: "1 day ago",
  },
  {
    id: "6",
    type: "run",
    user: "PlayerThree",
    action: "recorded a new run",
    timestamp: "1 day ago",
    metadata: "Score: 87",
  },
];

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "vote":
      return <ThumbUpIcon />;
    case "run":
      return <VideoIcon />;
    case "tournament":
      return <TrophyIcon />;
    case "admin":
      return <AdminIcon />;
    case "post":
      return <ArticleIcon />;
    default:
      return null;
  }
}

function getActivityColor(type: Activity["type"], theme: Theme) {
  switch (type) {
    case "vote":
      return theme.palette.success.main;
    case "run":
      return theme.palette.info.main;
    case "tournament":
      return theme.palette.warning.main;
    case "admin":
      return theme.palette.error.main;
    case "post":
      return theme.palette.primary.main;
    default:
      return theme.palette.text.secondary;
  }
}

export default function ActivityFeed() {
  const theme = useTheme();

  return (
    <MotionCard
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      elevation={2}
      sx={{
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Latest updates from the community
        </Typography>

        <List sx={{ p: 0 }}>
          {sampleActivities.map((activity, index) => (
            <MotionListItem
              key={activity.id}
              alignItems="flex-start"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: index < sampleActivities.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: `${getActivityColor(activity.type, theme)}20`,
                    color: getActivityColor(activity.type, theme),
                    width: 40,
                    height: 40,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box>
                    <Typography component="span" variant="body2" fontWeight={600}>
                      {activity.user}
                    </Typography>{" "}
                    <Typography component="span" variant="body2" color="text.secondary">
                      {activity.action}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {activity.metadata && (
                      <Chip
                        label={activity.metadata}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          mb: 0.5,
                        }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {activity.timestamp}
                    </Typography>
                  </Box>
                }
              />
            </MotionListItem>
          ))}
        </List>
      </CardContent>
    </MotionCard>
  );
}
