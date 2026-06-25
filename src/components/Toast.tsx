"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, action, onDismiss, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] mx-auto max-w-sm animate-slide-up sm:bottom-8">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-text-primary px-5 py-3 shadow-xl">
        <p className="text-[15px] font-medium text-white">{message}</p>
        {action && (
          <button onClick={action.onClick} className="shrink-0 rounded-xl px-3 py-1 text-[15px] font-semibold text-brand-300 transition-colors hover:text-brand-200 active:opacity-70">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
