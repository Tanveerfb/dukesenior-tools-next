"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Snackbar, Alert, AlertTitle, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

interface ToastMessage {
  id: string;
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    variant?: ToastMessage["variant"],
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCounter = 0;

const MotionBox = motion(Box);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    message: string,
    variant: ToastMessage["variant"] = "info",
    duration = 3000
  ) => {
    const id = `toast-${++toastCounter}`;
    const newToast: ToastMessage = { id, message, variant, duration };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleClose = useCallback((id: string) => (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    removeToast(id);
  }, [removeToast]);

  const variantTitles = {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <MotionBox
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
            >
              <Snackbar
                open={true}
                autoHideDuration={toast.duration}
                onClose={handleClose(toast.id)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{ position: "relative", top: 0, right: 0 }}
              >
                <Alert
                  onClose={handleClose(toast.id)}
                  severity={toast.variant}
                  variant="filled"
                  sx={{ width: "100%", minWidth: 300 }}
                >
                  <AlertTitle>{variantTitles[toast.variant || "info"]}</AlertTitle>
                  {toast.message}
                </Alert>
              </Snackbar>
            </MotionBox>
          ))}
        </AnimatePresence>
      </Box>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
