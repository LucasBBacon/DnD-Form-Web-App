import type React from "react";
import { useEffect } from "react";
import "./Toast.css";

export interface ToastProps {
  /** The message to display in the toast */
  message: string;
  /** Duration in milliseconds before the toast auto-dismisses (0 = no auto-dismiss) */
  duration?: number;
  /** Type of toast (info, success, warning, error) */
  type?: "info" | "success" | "warning" | "error";
  /** Callback when the toast is dismissed */
  onDismiss?: () => void;
}

/**
 * Simple toast notification component that auto-dismisses after a set duration.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  type = "info",
  onDismiss,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button
          className="toast-close"
          onClick={() => onDismiss?.()}
          aria-label="Dismiss toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
