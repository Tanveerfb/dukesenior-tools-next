import toast from "react-hot-toast";

/**
 * Toast helper utilities using react-hot-toast
 * These can be used as alternatives to the ToastProvider context
 */

export const showSuccessToast = (message: string, duration = 3000) => {
  return toast.success(message, {
    duration,
    style: {
      background: "var(--bs-success)",
      color: "white",
    },
  });
};

export const showErrorToast = (message: string, duration = 4000) => {
  return toast.error(message, {
    duration,
    style: {
      background: "var(--bs-danger)",
      color: "white",
    },
  });
};

export const showWarningToast = (message: string, duration = 3500) => {
  return toast(message, {
    duration,
    icon: "⚠️",
    style: {
      background: "var(--bs-warning)",
      color: "var(--bs-dark)",
    },
  });
};

export const showInfoToast = (message: string, duration = 3000) => {
  return toast(message, {
    duration,
    icon: "ℹ️",
    style: {
      background: "var(--bs-info)",
      color: "white",
    },
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    style: {
      background: "var(--bs-primary)",
      color: "white",
    },
  });
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const dismissAllToasts = () => {
  toast.dismiss();
};
