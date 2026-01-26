"use client";
import { Modal, Table, Badge } from "react-bootstrap";
import { FiSearch, FiSun, FiMoon, FiHelpCircle } from "react-icons/fi";

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
        <>
          <FiSun className="text-warning" /> / <FiMoon className="text-info" />
        </>
      ),
    },
    {
      key: "⌘? / Ctrl+?",
      description: "Show keyboard shortcuts",
      icon: <FiHelpCircle className="text-success" />,
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
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <FiHelpCircle />
          Keyboard Shortcuts
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table hover responsive className="mb-0">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Shortcut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((shortcut, index) => (
              <tr key={index}>
                <td>
                  <Badge
                    bg="secondary"
                    className="font-monospace fs-6 fw-normal py-2 px-3"
                  >
                    {shortcut.key}
                  </Badge>
                </td>
                <td className="d-flex align-items-center gap-2">
                  {shortcut.icon}
                  <span>{shortcut.description}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="mt-3 small text-muted">
          <p className="mb-0">
            <strong>Note:</strong> On Mac, use <kbd>⌘</kbd> (Command). On
            Windows/Linux, use <kbd>Ctrl</kbd>.
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
}
