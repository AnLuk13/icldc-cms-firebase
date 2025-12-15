"use client";

import { toast as toastify } from "react-toastify";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function toast({ title, description, variant }: ToastOptions) {
  const message =
    title && description
      ? `${title}\n${description}`
      : title || description || "";

  if (variant === "destructive") {
    toastify.error(message, {
      style: { whiteSpace: "pre-line" },
    });
  } else {
    toastify.success(message, {
      style: { whiteSpace: "pre-line" },
    });
  }
}

export function useToast() {
  return {
    toast,
  };
}
