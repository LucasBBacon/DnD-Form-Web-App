import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./DiceRoller.css";
import { PolyDie, type DieType } from "./PolyDie";

export type DiceRollerSize = "small" | "medium" | "large";

export interface DiceRollSummary {
  sides: DieType;
  count: number;
  total: number;
}

interface DiceRollerProps {
  sides?: DieType;
  count?: number;
  size?: DiceRollerSize;
  hideTotal?: boolean;
  rollLabel?: string;
  className?: string;
  disabled?: boolean;
  random?: () => number;
  animationMs?: number;
  onRollComplete?: (rolls: number[], summary: DiceRollSummary) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  sides = 20,
  count = 1,
  size = "large",
  hideTotal = false,
  rollLabel,
  className,
  disabled = false,
  random = Math.random,
  animationMs = 1000,
  onRollComplete,
}) => {
  const [values, setValues] = useState<number[]>(
    Array.from({ length: Math.max(1, Math.floor(count)) }, () => 1),
  );
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const rollInterval = useRef<number | null>(null);
  const rollTimeout = useRef<number | null>(null);

  const safeCount = Math.max(1, Math.floor(count));

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

  useEffect(() => {
    return () => {
      if (rollInterval.current != null) {
        clearInterval(rollInterval.current);
      }
      if (rollTimeout.current != null) {
        clearTimeout(rollTimeout.current);
      }
    };
  }, []);

  const rollDice = () => {
    if (isRolling || disabled) return;
    setIsRolling(true);

    rollInterval.current = window.setInterval(() => {
      setValues(generateRolls(safeCount, sides));
    }, 80);

    rollTimeout.current = window.setTimeout(() => {
      if (rollInterval.current != null) {
        clearInterval(rollInterval.current);
      }

      const finalRolls = generateRolls(safeCount, sides);
      setValues(finalRolls);
      setIsRolling(false);

      if (onRollComplete) {
        onRollComplete(finalRolls, {
          sides,
          count: safeCount,
          total: finalRolls.reduce((sum, value) => sum + value, 0),
        });
      }
    }, animationMs);
  };

  const totalSum = values.reduce((sum, val) => sum + val, 0);
  const displayedValues = Array.from(
    { length: safeCount },
    (_, index) => values[index] ?? 1,
  );
  const rollerClassName = [
    "dice-roller",
    `size-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const isDisabled = isRolling || disabled;

  return (
    <div className={rollerClassName}>
      <button
        type="button"
        className={`dice-tray ${isDisabled ? "disabled" : ""}`}
        onClick={rollDice}
        disabled={isDisabled}
        aria-label={resolvedRollLabel}
      >
        {!isRolling && (
          <div className="dice-tray-overlay">
            {resolvedRollLabel}
          </div>
        )}

        {displayedValues.map((val, index) => (
          <PolyDie
            key={index}
            sides={sides}
            value={val}
            isRolling={isRolling}
          />
        ))}
      </button>

      {!hideTotal && !isRolling && (
        <h2 className="total-label">
          Total: <span className="total-value">{totalSum}</span>
        </h2>
      )}
    </div>
  );
};
