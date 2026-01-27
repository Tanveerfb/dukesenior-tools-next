"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Box,
  Typography,
  Stack,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon, HelpOutline as HelpIcon } from "@mui/icons-material";
import { FiSearch, FiSun, FiMoon, FiHelpCircle } from "react-icons/fi";

interface KeyboardShortcutsModalProps {
  show: boolean;
  onHide: () => void;
}

export default function KeyboardShortcutsModal({
  show,
  onHide,
}: KeyboardShortcutsModalProps) {
  const theme = useTheme();

  const shortcuts = [
    {
      key: "⌘K / Ctrl+K",
      description: "Open search",
      icon: <FiSearch style={{ color: theme.palette.primary.main }} />,
    },
    {
      key: "⌘/ / Ctrl+/",
      description: "Toggle theme (light/dark)",
      icon: (
        <>
          <FiSun style={{ color: theme.palette.warning.main }} /> /{" "}
          <FiMoon style={{ color: theme.palette.info.main }} />
        </>
      ),
    },
    {
      key: "⌘? / Ctrl+?",
      description: "Show keyboard shortcuts",
      icon: <FiHelpCircle style={{ color: theme.palette.success.main }} />,
    },
    {
      key: "Esc",
      description: "Close modals/dialogs",
      icon: null,
    },
    {
      key: "↑ / ↓",
      description: "Navigate search results",
      icon: null,
    },
    {
      key: "Enter",
      description: "Open selected search result",
      icon: null,
    },
  ];

  return (
    <Dialog open={show} onClose={onHide} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <HelpIcon />
          <Typography variant="h6">Keyboard Shortcuts</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            aria-label="close"
            onClick={onHide}
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "30%", fontWeight: 600 }}>Shortcut</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shortcuts.map((shortcut, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Chip
                    label={shortcut.key}
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      fontWeight: 400,
                      py: 2,
                      px: 1.5,
                      bgcolor: "action.hover",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {shortcut.icon}
                    <span>{shortcut.description}</span>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> On Mac, use <kbd>⌘</kbd> (Command). On
            Windows/Linux, use <kbd>Ctrl</kbd>.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
