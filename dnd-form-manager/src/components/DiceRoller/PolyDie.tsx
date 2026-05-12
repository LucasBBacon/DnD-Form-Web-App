import React from "react";
import "./Dice.css";

// #region Types and Interfaces

export type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface PolyDieProps {
  /** The number of sides on the die */
  sides: DieType;
  /** The current value of the die */
  value: number;
  /** Whether the die is currently rolling */
  isRolling: boolean;
}

// #endregion

// #region Component

export const PolyDie: React.FC<PolyDieProps> = ({
  sides,
  value,
  isRolling,
}) => {
  let displayValue = value.toString();

  if (sides === 100) {
    const tens = (value % 10) * 10;
    displayValue = tens === 0 ? "00" : tens.toString();
  }

  let statusClass = "";
  if (sides === 20 && !isRolling) {
    if (value === 20) statusClass = "crit-success";
    if (value === 1) statusClass = "crit-fail";
  }
  return (
    <div
      className={`die-base shape-d${sides} ${isRolling ? "rolling" : ""} ${statusClass}`}
    >
      <span>{displayValue}</span>
    </div>
  );
};

// #endregion
