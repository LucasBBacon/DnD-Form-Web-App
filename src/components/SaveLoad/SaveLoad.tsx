import type React from "react";
import { useEffect, useState } from "react";
import "./SaveLoad.css";
import { AlertCircle, Feather, FolderOpen, Save, X } from "lucide-react";

export interface SaveLoadProps {
  onSave: () => void;
  onLoadRequest: () => void;
  errorMessage?: string | null;
  clearError?: () => void;
}

export const SaveLoad: React.FC<SaveLoadProps> = ({
  onSave,
  onLoadRequest,
  errorMessage,
  clearError,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (errorMessage) setIsExpanded(true);
  }, [errorMessage]);

  return (
    <div
      className="save-load-container"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Expanding menu */}
      <div
        className={`save-menu-options ${isExpanded ? "is-visible" : ""}`}
      >
        {errorMessage && (
          <div className="save-error-toast">
            <AlertCircle size={14} className="error-icon" />
            <span className="error-text">{errorMessage}</span>
            <button className="clear-error-btn" onClick={clearError}>
              <X size={14} />
            </button>
          </div>
        )}

        <button className="save-action-btn" onClick={onLoadRequest}>
          <span className="action-label">Load Data</span>
          <div className="action-icon-wrapper">
            <FolderOpen size={16} />
          </div>
        </button>

        <button className="save-action-btn" onClick={onSave}>
          <span className="action-label">Save Data</span>
          <div className="action-icon-wrapper">
            <Save size={16} />
          </div>
        </button>
      </div>

      {/* Primary anchor button */}
      <button
        className={`scribe-seal-btn ${isExpanded ? "is-active" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Save Options"
      >
        <Feather size={20} className="seal-icon" />
      </button>
    </div>
  );
};
