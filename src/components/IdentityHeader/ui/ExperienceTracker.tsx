import type React from "react";
import "./ExperienceTracker.css";
import type { CharacterClassEntry } from "../IdentityHeader";
import { XP_THRESHOLDS, type LevelUpMode } from "../../../types/progression";
import { Settings2 } from "lucide-react";

export const ExperienceTracker: React.FC<{
  xp: number;
  classes: CharacterClassEntry[];
  levelUpMode: LevelUpMode;
  onXpChange: (val: number) => void;
  onModeChange: (mode: LevelUpMode) => void;
}> = ({ xp, classes, levelUpMode, onXpChange, onModeChange }) => {
  const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);

  // Cap the level check at 20 to prevent array out-of-bounds
  const safeLevel = Math.min(Math.max(1, totalLevel), 20);
  const currentLevelXp = XP_THRESHOLDS[safeLevel - 1];
  const nextLevelXp =
    safeLevel < 20 ? XP_THRESHOLDS[safeLevel] : currentLevelXp;

  // Calculate progress bar percentage
  const progressPercent =
    safeLevel === 20
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
          ),
        );

  return (
    <div className="header-box xp-box">
      <div className="box-label xp-header">
        <span>Experience Points</span>
        <button
          className="xp-mode-toggle"
          onClick={() =>
            onModeChange(levelUpMode === "xp" ? "milestone" : "xp")
          }
          title={`Currently using ${levelUpMode} leveling`}
        >
          <Settings2 size={12} />
        </button>
      </div>

      {levelUpMode === "milestone" ? (
        <div className="milestone-display">Milestone Progression</div>
      ) : (
        <div className="xp-interactive-area">
          <input
            type="number"
            className="manuscript-input xp-input"
            value={xp || ""}
            onChange={(e) => onXpChange(parseInt(e.target.value) || 0)}
            min="0"
          />
          <span className="xp-separator">/</span>
          <span className="xp-next">{nextLevelXp}</span>
        </div>
      )}

      {levelUpMode === "xp" && safeLevel < 20 && (
        <div className="xp-progress-bar">
          <div className="xp-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </div>
  );
};
