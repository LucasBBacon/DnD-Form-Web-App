import "./AttackRollModeToggle.css";
import type React from "react";

export type AttackRollMode = "normal" | "advantage" | "disadvantage";

const MODES: AttackRollMode[] = ["normal", "advantage", "disadvantage"];

const LABELS: Record<AttackRollMode, string> = {
  normal: "Normal",
  advantage: "Advantage",
  disadvantage: "Disadvantage",
};

interface AttackRollModeToggleProps {
  /** The unique identifier for the entry */
  entryId: string;
  /** The current attack roll mode */
  mode: AttackRollMode;
  /** Callback function when the mode changes */
  onChange: (mode: AttackRollMode) => void;
  /** Optional label for the toggle group */
  label?: string;
  /** When true the toggle is read-only (all options disabled) */
  disabled?: boolean;
}

export const AttackRollModeToggle: React.FC<AttackRollModeToggleProps> = ({
  entryId,
  mode,
  onChange,
  label,
  disabled = false,
}) => (
  <div
    className={`attack-roll-mode-group${disabled ? " locked" : ""}`}
    role="radiogroup"
    aria-label={label ?? `${entryId} to-hit mode`}
    aria-disabled={disabled}
  >
    {MODES.map((m) => (
      <label
        key={`${entryId}-${m}`}
        className={`attack-roll-mode-option ${mode === m ? "selected" : ""}${disabled ? " disabled" : ""}`}
      >
        <input
          type="radio"
          name={`roll-mode-${entryId}`}
          checked={mode === m}
          onChange={() => { if (!disabled) onChange(m); }}
          disabled={disabled}
        />
        {LABELS[m]}
      </label>
    ))}
  </div>
);
