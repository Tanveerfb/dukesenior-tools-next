"use client";
import { Dialog } from "@base-ui/react/dialog";
import { FiX, FiHelpCircle, FiSearch, FiSun, FiMoon } from "react-icons/fi";

interface KeyboardShortcutsModalProps {
  show: boolean;
  onHide: () => void;
}

export default function KeyboardShortcutsModal({
  show,
  onHide,
}: KeyboardShortcutsModalProps) {
  const shortcuts = [
    {
      key: "⌘K / Ctrl+K",
      description: "Open search",
      icon: <FiSearch className="text-primary" />,
    },
    {
      key: "⌘/ / Ctrl+/",
      description: "Toggle theme (light/dark)",
      icon: (
        <span className="flex items-center gap-1">
          <FiSun className="text-warning" /> / <FiMoon className="text-info" />
        </span>
      ),
    },
    {
      key: "⌘? / Ctrl+?",
      description: "Show keyboard shortcuts",
      icon: <FiHelpCircle className="text-success" />,
    },
    { key: "Esc", description: "Close modals/dialogs", icon: null },
    { key: "↑ / ↓", description: "Navigate search results", icon: null },
    { key: "Enter", description: "Open selected search result", icon: null },
  ];

  return (
    <Dialog.Root open={show} onOpenChange={(open) => !open && onHide()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Popup className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card dark:bg-card-dark rounded-2xl shadow-soft-lg border border-border dark:border-border-dark animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-border-dark">
              <div className="flex items-center gap-2">
                <FiHelpCircle
                  className="text-foreground-muted dark:text-foreground-dark-muted"
                  size={20}
                />
                <Dialog.Title className="text-lg font-semibold text-foreground dark:text-foreground-dark">
                  Keyboard Shortcuts
                </Dialog.Title>
              </div>
              <Dialog.Close
                className="p-2 rounded-lg text-foreground-muted hover:bg-surface-200 dark:hover:bg-surface-900 transition-colors"
                aria-label="Close"
              >
                <FiX size={18} />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left py-3 pr-4 w-[35%] text-sm font-semibold text-foreground dark:text-foreground-dark">
                      Shortcut
                    </th>
                    <th className="text-left py-3 text-sm font-semibold text-foreground dark:text-foreground-dark">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shortcuts.map((shortcut, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 dark:border-border-dark/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-900/30 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <kbd className="inline-block font-mono text-sm bg-surface-100 dark:bg-surface-900 text-foreground dark:text-foreground-dark px-3 py-1.5 rounded-md border border-border dark:border-border-dark">
                          {shortcut.key}
                        </kbd>
                      </td>
                      <td className="py-3">
                        <span className="flex items-center gap-2 text-sm text-foreground dark:text-foreground-dark">
                          {shortcut.icon}
                          {shortcut.description}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-4 text-sm text-foreground-muted dark:text-foreground-dark-muted">
                <strong>Note:</strong> On Mac, use{" "}
                <kbd className="px-1 py-0.5 bg-surface-100 dark:bg-surface-900 rounded text-xs border border-border dark:border-border-dark">
                  ⌘
                </kbd>{" "}
                (Command). On Windows/Linux, use{" "}
                <kbd className="px-1 py-0.5 bg-surface-100 dark:bg-surface-900 rounded text-xs border border-border dark:border-border-dark">
                  Ctrl
                </kbd>
                .
              </p>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
