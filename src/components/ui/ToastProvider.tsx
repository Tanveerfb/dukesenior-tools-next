"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

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
    duration?: number,
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCounter = 0;

const variantStyles: Record<string, string> = {
  success: "bg-success text-white",
  error: "bg-danger text-white",
  warning: "bg-warning text-white",
  info: "bg-info text-white",
};

const variantIcons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

const variantTitles = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  const variant = toast.variant || "info";
  const Icon = variantIcons[variant];

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-3 min-w-[300px] max-w-md rounded-lg px-4 py-3 shadow-soft-lg",
        variantStyles[variant],
      )}
    >
      <Icon className="mt-0.5 shrink-0" size={18} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{variantTitles[variant]}</p>
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <FiX size={16} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (
      message: string,
      variant: ToastMessage["variant"] = "info",
      duration = 3000,
    ) => {
      const id = `toast-${++toastCounter}`;
      const newToast: ToastMessage = { id, message, variant, duration };
      setToasts((prev) => [...prev, newToast]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
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
