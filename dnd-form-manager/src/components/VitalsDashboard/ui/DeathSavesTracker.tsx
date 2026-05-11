import type React from "react";
import "./DeathSavesTracker.css";

interface DeathSavesTrackerProps {
  successes: number;
  failures: number;
  onToggle: (type: "successes" | "failures", checked: boolean) => void;
}

export const DeathSavesTracker: React.FC<DeathSavesTrackerProps> = ({
  successes,
  failures,
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
          checked={successes >= num}
          onChange={(e) => onToggle("successes", e.target.checked)}
        />
      ))}
    </div>
    <div className="saves-row failures">
      <span>FAILURES</span>
      {[1, 2, 3].map((num) => (
        <input
          key={`fail-${num}`}
          type="checkbox"
          checked={failures >= num}
          onChange={(e) => onToggle("failures", e.target.checked)}
        />
      ))}
    </div>
  </div>
);
