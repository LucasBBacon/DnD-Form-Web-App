import type React from "react";
import "./ManuscriptField.css";
import type { RoleplayField } from "../RoleplayBoardView";
import { useEffect, useState } from "react";

interface ManuscriptFieldProps {
  label: string;
  fieldId: RoleplayField;
  initialValue: string;
  isMultiline?: boolean;
  onBlur: (field: RoleplayField, value: string) => void;
  className?: string;
}

export const ManuscriptField: React.FC<ManuscriptFieldProps> = ({
  label,
  fieldId,
  initialValue,
  isMultiline = false,
  onBlur,
  className = "",
}) => {
  const [localValue, setLocalValue] = useState(initialValue);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    if (localValue !== initialValue) {
      onBlur(fieldId, localValue);
    }
  };

  return (
    <div className={`manuscript-field-wrapper ${className}`}>
      <label className="manuscript-field-label" htmlFor={fieldId}>
        {label}
      </label>
      {isMultiline ? (
        <textarea
          id={fieldId}
          className="manuscript-input-area"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          rows={4}
        />
      ) : (
        <input
          type="text"
          id={fieldId}
          className="manuscript-input-line"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
        />
      )}
    </div>
  );
};
