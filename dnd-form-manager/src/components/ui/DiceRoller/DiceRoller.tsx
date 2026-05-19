import type React from "react";
import { useMemo, useRef, useState } from "react";
import "./DiceRoller.css";
import { type DieType } from "./PolyDie";
import { Check, Dices, PenTool } from "lucide-react";

// #region Types and Interfaces

export type DiceRollerSize = "small" | "medium" | "large";

export interface DiceRollSummary {
  /** The number of sides on each die */
  sides: DieType;
  /** The number of dice rolled */
  count: number;
  /** The total sum of all dice rolled */
  total: number;
}

interface DiceRollerProps {
  /** The number of sides on each die */
  sides?: DieType;
  /** The number of dice to roll */
  count?: number;
  /** The size of the dice roller */
  size?: DiceRollerSize;
  /** Whether to hide the total sum */
  hideTotal?: boolean;
  /** Custom label for the roll button */
  rollLabel?: string;
  /** Additional CSS class for the dice roller */
  className?: string;
  /** Whether the dice roller is disabled */
  disabled?: boolean;
  /** Custom random number generator function */
  random?: () => number;
  /** Duration of the roll animation in milliseconds */
  animationMs?: number;
  /** Callback function called when the roll is complete */
  onRollComplete?: (rolls: number[], summary: DiceRollSummary) => void;
}

// #endregion

// #region Component

export const DiceRoller: React.FC<DiceRollerProps> = ({
  sides = 20,
  count = 1,
  rollLabel,
  className = "",
  disabled = false,
  random = Math.random,
  animationMs = 1000,
  onRollComplete,
}) => {
  const safeCount = Math.max(1, Math.floor(count));

  // State
  const [inputMode, setInputMode] = useState<"digital" | "manual">("digital");
  const [manualTotal, setManualTotal] = useState<number | "">("");

  const [values, setValues] = useState<number[]>(Array(safeCount).fill(1));

  const [isRolling, setIsRolling] = useState<boolean>(false);
  const rollInterval = useRef<number | null>(null);

  const resolvedRollLabel = useMemo(() => {
    if (rollLabel) return rollLabel;
    const dieLabel = sides === 100 ? "%" : sides;
    return `Roll ${safeCount}d${dieLabel}`;
  }, [rollLabel, safeCount, sides]);

  const generateRolls = (count: number, sides: number) => {
    return Array.from(
      { length: count },
      () => Math.floor(random() * sides) + 1,
    );
  };

  const executeDigitalRoll = () => {
    if (disabled || isRolling) return;
    setIsRolling(true);

    rollInterval.current = window.setInterval(() => {
      setValues(generateRolls(safeCount, sides));
    }, 50);

    setTimeout(() => {
      if (rollInterval.current) clearInterval(rollInterval.current);

      const finalRolls = generateRolls(safeCount, sides);
      const total = finalRolls.reduce((a, b) => a + b, 0);

      setValues(finalRolls);
      setIsRolling(false);

      if (onRollComplete) {
        onRollComplete(finalRolls, { sides, count: safeCount, total });
      }
    }, animationMs);
  };

  const executeManualRoll = () => {
    if (manualTotal === "" || disabled) return;

    const total = Number(manualTotal);
    if (onRollComplete) {
      onRollComplete([total], { sides, count: safeCount, total });
    }
    setManualTotal("");
  };

  return (
    <div className={`dice-roller-wrapper ${className}`}>
      {/* Mode Toggle Button */}
      <button
        className="mode-toggle-btn"
        onClick={() =>
          setInputMode((prev) => (prev === "digital" ? "manual" : "digital"))
        }
        title={
          inputMode === "digital"
            ? "Switch to Manual physical roll"
            : "Switch to Digital roll"
        }
        disabled={disabled || isRolling}
      >
        {inputMode === "digital" ? <Dices size={14} /> : <PenTool size={14} />}
      </button>

      {/* Control Area */}

      <div className="roller-control-area">
        {inputMode === "digital" ? (
          <button
            className={`action-btn roll-btn ${isRolling ? "is-rolling" : ""}`}
            onClick={executeDigitalRoll}
            disabled={disabled}
          >
            {resolvedRollLabel}
          </button>
        ) : (
          <div className="manual-input-group">
            <input
              type="number"
              className="manuscript-input manual-roll-input"
              value={manualTotal}
              onChange={(e) =>
                setManualTotal(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="Total..."
              min="1"
              onKeyDown={(e) => e.key === "Enter" && executeManualRoll()}
            />
            <button
              className="action-btn scribe-btn"
              onClick={executeManualRoll}
              disabled={manualTotal === ""}
            >
              <Check size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// #endregion
