import type React from "react";
import "./VersatileModeToggle.css";

export type VersatileMode = "one-handed" | "two-handed";

interface VersatileModeToggleProps {
  entryId: string;
  baseDamageDice: string;
  versatileDamageDice: string;
  value: VersatileMode;
  onChange: (value: VersatileMode) => void;
}

export const VersatileModeToggle: React.FC<VersatileModeToggleProps> = ({
  entryId,
  baseDamageDice,
  versatileDamageDice,
  value,
  onChange,
}) => {
  return (
    <fieldset className="versatile-mode-toggle">
      <legend className="versatile-mode-legend">Grip</legend>

      <label className="versatile-mode-option">
        <input
          type="radio"
          name={`versatile-mode-${entryId}`}
          checked={value === "one-handed"}
          onChange={() => onChange("one-handed")}
        />
        <span>1-handed ({baseDamageDice})</span>
      </label>

      <label className="versatile-mode-option">
        <input
          type="radio"
          name={`versatile-mode-${entryId}`}
          checked={value === "two-handed"}
          onChange={() => onChange("two-handed")}
        />
        <span>2-handed ({versatileDamageDice})</span>
      </label>
    </fieldset>
  );
};
