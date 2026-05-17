import type React from "react";
import "./CombatDefenses.css";
import { AlertTriangle, Footprints, Shield, Zap } from "lucide-react";
import { ManuscriptTooltip } from "../../ui/ManuscriptTooltip/ManuscriptTooltip";

export interface CombatDefensesProps {
  armorClass: number;
  initiative: number;
  speed: number;
  isArmorPenalized: boolean;
}

export const CombatDefenses: React.FC<CombatDefensesProps> = ({
  armorClass,
  initiative,
  speed,
  isArmorPenalized,
}) => {
  // Always format initiative with a + or -
  const formattedInitiative =
    initiative >= 0 ? `+${initiative}` : `${initiative}`;

  return (
    <div className="combat-defenses-container">
      {/* Initiative */}
      <div className="defense-crest minor-crest">
        <div className="crest-value-group">
          <Zap size={14} className="crest-icon" />
          <span className="crest-value">{formattedInitiative}</span>
        </div>
        <span className="crest-label">Initiative</span>
      </div>

      {/* Armor Class */}
      <div className="defense-crest major-crest">
        <Shield size={14} className="crest-icon" />
        <span className="crest-value ac-value">{armorClass}</span>
        <span className="crest-label">Armor Class</span>
      </div>

      {/* Speed */}
      <div className="defense-crest minor-crest">
        <div className="crest-value-group">
          <Footprints size={14} className="crest-icon" />
          <span
            className={`crest-value ${isArmorPenalized ? "penalized-text" : ""}`}
          >
            {speed} ft
          </span>

          {/* Warning */}
          {isArmorPenalized && (
            <ManuscriptTooltip
              title="Heavy Armor Penalty"
              content="Speed is reduced by 10 feet because your Strength score does not meet the armor's requirement."
              className="speed-warning-tooltip"
              showIndicator={false}
            >
              <AlertTriangle size={14} className="warning-icon pulse-warning" />
            </ManuscriptTooltip>
          )}
        </div>
        <span className="crest-label">Speed</span>
      </div>
    </div>
  );
};
