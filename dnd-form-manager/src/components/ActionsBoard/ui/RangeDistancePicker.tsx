import type React from "react";
import type { WeaponRangeBand } from "../../../types/item";
import "./RangeDistancePicker.css";

export type AttackRangeSelection = "normal" | "long";

interface RangeDistancePickerProps {
  entryId: string;
  rangeInfo: WeaponRangeBand;
  value: AttackRangeSelection;
  onChange: (value: AttackRangeSelection) => void;
}

export const RangeDistancePicker: React.FC<RangeDistancePickerProps> = ({
  entryId,
  rangeInfo,
  value,
  onChange,
}) => {
  const hasLongRange = typeof rangeInfo.long === "number";

  return (
    <fieldset className="range-distance-picker">
      <legend className="range-distance-legend">Distance</legend>

      <label className="range-distance-option">
        <input
          type="radio"
          name={`range-distance-${entryId}`}
          checked={value === "normal"}
          onChange={() => onChange("normal")}
        />
        <span>Normal ({rangeInfo.normal} ft)</span>
      </label>

      {hasLongRange && (
        <label className="range-distance-option">
          <input
            type="radio"
            name={`range-distance-${entryId}`}
            checked={value === "long"}
            onChange={() => onChange("long")}
          />
          <span>Long ({rangeInfo.long} ft)</span>
        </label>
      )}

      {hasLongRange && value === "long" && (
        <p className="range-distance-warning">
          Long range selected: attacks are typically made with disadvantage.
        </p>
      )}
    </fieldset>
  );
};
