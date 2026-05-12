import type React from "react";
import "./StatsTopBar.css";

// #region Interfaces

interface Passives {
  /** The character's passive perception score */
  perception: number;
  /** The character's passive investigation score */
  investigation: number;
  /** The character's passive insight score */
  insight: number;
}

interface StatsTopBarProps {
  /** The character's proficiency bonus */
  proficiencyBonus: number;
  /** The character's passive scores */
  passives: Passives;
}

// #endregion

// #region Helpers

const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

// #endregion

// #region Component

export const StatsTopBar: React.FC<StatsTopBarProps> = ({
  proficiencyBonus,
  passives,
}) => (
  <div className="stats-top-bar">
    <div className="badge-pill">
      <span className="label">PROFICIENCY BONUS</span>
      <span className="value">{formatMod(proficiencyBonus)}</span>
    </div>
    <div className="passives-group">
      <div className="badge-pill" title="Passive Perception">
        <span className="icon">👁️</span>
        <span className="value">{passives.perception}</span>
      </div>
      <div className="badge-pill" title="Passive Investigation">
        <span className="icon">🔍</span>
        <span className="value">{passives.investigation}</span>
      </div>
      <div className="badge-pill" title="Passive Insight">
        <span className="icon">💡</span>
        <span className="value">{passives.insight}</span>
      </div>
    </div>
  </div>
);

// #endregion
