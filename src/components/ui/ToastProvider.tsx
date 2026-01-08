"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

interface ToastMessage {
  id: string;
  message: string;
  variant?: "success" | "danger" | "warning" | "info";
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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    variant: ToastMessage["variant"] = "info",
    duration = 3000
  ) => {
    const id = `toast-${++toastCounter}`;
    const newToast: ToastMessage = { id, message, variant, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (toasts.length === 0) return;

    const latestToast = toasts[toasts.length - 1];
    const timeoutId = setTimeout(() => {
      removeToast(latestToast.id);
    }, latestToast.duration);

    return () => clearTimeout(timeoutId);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999, position: "fixed" }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
            >
              <Toast
                onClose={() => removeToast(toast.id)}
                bg={toast.variant}
                className="mb-2"
              >
                <Toast.Header>
                  <strong className="me-auto">
                    {toast.variant === "success" && "Success"}
                    {toast.variant === "danger" && "Error"}
                    {toast.variant === "warning" && "Warning"}
                    {toast.variant === "info" && "Info"}
                  </strong>
                </Toast.Header>
                <Toast.Body
                  className={
                    toast.variant === "success" ||
                    toast.variant === "danger" ||
                    toast.variant === "warning"
                      ? "text-white"
                      : ""
                  }
                >
                  {toast.message}
                </Toast.Body>
              </Toast>
            </motion.div>
          ))}
        </AnimatePresence>
      </ToastContainer>
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
