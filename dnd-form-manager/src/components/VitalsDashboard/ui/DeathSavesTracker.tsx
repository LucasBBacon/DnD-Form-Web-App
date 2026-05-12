import type React from "react";
import "./DeathSavesTracker.css";

// #region Interface

interface DeathSavesTrackerProps {
  /** The number of successful death saves */
  success: number;
  /** The number of failed death saves */
  failure: number;

  /** Callback for when a death save checkbox is toggled */
  onToggle: (type: "success" | "failure", checked: boolean) => void;
}

// #endregion

// #region Component

export const DeathSavesTracker: React.FC<DeathSavesTrackerProps> = ({
  success,
  failure,
  onToggle,
}) => (
  <div className="death-saves-block">
    <div className="block-header">DEATH SAVES</div>
    <div className="saves-row successes">
      <span>SUCCESS</span>
      {[1, 2, 3].map((num) => (
        <input
          key={`succ-${num}`}
          type="checkbox"
          checked={success >= num}
          onChange={(e) => onToggle("success", e.target.checked)}
        />
      ))}
    </div>
    <div className="saves-row failures">
      <span>FAILURES</span>
      {[1, 2, 3].map((num) => (
        <input
          key={`fail-${num}`}
          type="checkbox"
          checked={failure >= num}
          onChange={(e) => onToggle("failure", e.target.checked)}
        />
      ))}
    </div>
  </div>
);

// #endregion
