import type React from "react";

interface Passives {
  perception: number;
  investigation: number;
  insight: number;
}

interface StatsTopBarProps {
  proficiencyBonus: number;
  passives: Passives;
}

const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

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
