import type React from "react";
import { useEffect } from "react";
import "./ConfirmationModal.css";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-parchment fadeInSale"
        role="dialog"
        aria-modal="true"
      >
        <h3 className="modal-title">{title}</h3>
        <hr className="filigree-divider" />
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button className="action-btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="action-btn destructive-btn" onClick={onConfirm}>
            Overwrite Save
          </button>
        </div>
      </div>
    </div>
  );
};
