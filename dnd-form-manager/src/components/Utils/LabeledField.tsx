import type React from "react";
import { useEffect, useRef, useState } from "react";

interface LabeledFieldProps {
  label: string;
  value: string | number;
  editMode?: "readonly" | "inline" | "modal";
  type?: "text" | "number";
  onChange?: (newValue: string) => void;
  onClickModal?: () => void;
  className?: string;
}

export const LabeledField: React.FC<LabeledFieldProps> = ({
  label,
  value,
  editMode = "readonly",
  type = "text",
  onChange,
  onClickModal,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input automatically when entering edit editMode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (tempValue !== value && onChange) {
      onChange(tempValue.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  // Render logic based on editMode
  if (isEditing && editMode === "inline") {
    return (
      <div className={`labeled-field-container editing ${className}`}>
        <input
          ref={inputRef}
          type={type}
          className="field-input"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        />
        <span className="field-label">{label.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div
      className={`labeled-field-container mode-${editMode} ${className}`}
      onClick={() => {
        if (editMode === "inline") setIsEditing(true);
        if (editMode === "modal" && onClickModal) onClickModal();
      }}
      title={
        editMode === "inline"
          ? "Click to edit"
          : editMode === "modal"
            ? "Click to open options"
            : ""
      }
    >
      <div className="field-value-wrapper">
        <span className="field-value">{value || "-"}</span>
        {/* Optional: Add tiny pencil/cog icons based on editMode */}
        {editMode === "inline" && <span className="edit-icon">✎</span>}
        {editMode === "modal" && <span className="edit-icon">⚙</span>}
      </div>
      <span className="field-label">{label.toUpperCase()}</span>
    </div>
  );
};
