import type React from "react";
import "./CoreStatsBoard.css";
import { AbilityCard, type CoreStatsAbilityEntry } from "./AbilityCard/AbilityCard";
import { Brain, Eye, Search } from "lucide-react";

// #region Interfaces

export interface CoreStatsBoardProps {
  proficiencyBonus: number;
  passives: {
    perception: number;
    investigation: number;
    insight: number;
  };
  abilities: CoreStatsAbilityEntry[];
}

// #endregion

// #region Component

export const CoreStatsBoard: React.FC<CoreStatsBoardProps> = ({
  proficiencyBonus,
  passives,
  abilities,
}) => {
  const handleSkillRoll = () => {};
  const handleSaveRoll = () => {};
  const handleAbilityCheckRoll = () => {};

  return (
    <div className="core-stats-container">
      
      {/* THE PASSIVES BANNER */}
      <div className="passives-banner">
        <div className="proficiency-badge">
          <span className="prof-label">Proficiency</span>
          <span className="prof-value">+{proficiencyBonus}</span>
        </div>
        
        <div className="passives-group">
          <div className="passive-stat">
            <Eye size={14} className="passive-icon" />
            <span className="passive-val">{passives.perception}</span>
            <span className="passive-label">Perception</span>
          </div>
          <div className="passive-stat">
            <Search size={14} className="passive-icon" />
            <span className="passive-val">{passives.investigation}</span>
            <span className="passive-label">Investigation</span>
          </div>
          <div className="passive-stat">
            <Brain size={14} className="passive-icon" />
            <span className="passive-val">{passives.insight}</span>
            <span className="passive-label">Insight</span>
          </div>
        </div>
      </div>

      {/* ABILITY GRID */}
      <div className="ability-grid">
        {abilities.map((ability) => (
          <AbilityCard
            key={ability.key}
            ability={ability}
            onSkillRoll={handleSkillRoll}
            onSaveRoll={handleSaveRoll}
            onAbilityCheckRoll={handleAbilityCheckRoll}
          />
        ))}
      </div>

    </div>
  );
};

// #endregion
