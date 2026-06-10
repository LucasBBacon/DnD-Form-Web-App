import React, { useEffect } from "react";
import "../LevelUpModal.css";
import "./HpGainStep.css";
import type { ClassData } from "../../../types/class";
import type { HitDie } from "../../../types/common";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import { useCharacterStats } from "../../../hooks/useCharacterStats";
import { AlertCircle, Calculator, Dices, Heart, Shield } from "lucide-react";

// #region --- Types ---

interface HpGainStepProps {
  /** The current draft of the level-up process */
  draft: LevelUpDraft;
  /** Callback to update the draft with new values */
  onUpdateDraft: (updates: Partial<LevelUpDraft>) => void;
  /** The result of the level-up planner */
  plan: LevelUpPlannerResult;
  /** Data for the currently selected class */
  classData: ClassData | null;
  /** Data for the currently selected subclass */
  subclassData: SubclassData | null;
  /** The target level for the level-up */
  targetLevel: number;
}

// #endregion

const averageForDie = (die: HitDie): number => Math.floor(die / 2) + 1;

/**
 * Step for determining the hit points gained during a level-up.
 * Only shown if the class being leveled up has a hit die.
 * @param param0 Props for the HP gain step
 * @returns JSX element for the HP gain step
 */
export const HpGainStep: React.FC<HpGainStepProps> = ({
  draft,
  onUpdateDraft,
  classData,
  targetLevel,
}) => {
  // #region --- State and Data ---

  const { abilities } = useCharacterStats();
  const conMod = abilities.modifiers.con;
  const hitDie: HitDie = (classData?.hitDie ?? 8) as HitDie;

  const isLevelOne = targetLevel === 1;
  const avgHp = isLevelOne ? hitDie : averageForDie(hitDie);
  const computedHp = Math.max(1, avgHp + conMod);

  // Auto-apply when using average or it's level 1
  useEffect(() => {
    if (draft.useAverageHp || isLevelOne) {
      onUpdateDraft({ hpGained: computedHp });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.useAverageHp, computedHp, isLevelOne]);

  const handleManualChange = (val: string) => {
    if (val === "") {
      onUpdateDraft({ hpGained: null });
      return;
    }

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= hitDie) {
      const withMod = Math.max(1, parsed + conMod);
      onUpdateDraft({ hpGained: withMod });
    }
  };

  if (!classData) {
    return (
      <div className="step-container error-state">
        <AlertCircle size={14} className="error-icon" />
        <p>No class data.</p>
      </div>
    );
  }

  const rawManualRoll =
    draft.hpGained !== null && !draft.useAverageHp
      ? Math.max(1, draft.hpGained - conMod)
      : "";

  // #endregion

  // #region --- Render ---

  return (
    <div className="step-container hp-gain-step">
      <div className="step-intro">
        <h3 className="step-title">Vitality & Vigor</h3>
        <p className="step-description">
          Determine the hit points gained for this level. Your vitality is tied
          to your {classData.name} training (d{hitDie}) and your Constitution.
        </p>
      </div>

      {isLevelOne ? (
        // --- LEVEL 1 (MAXIMIZED) ---
        <div className="hp-method-card is-locked">
          <Shield size={24} className="method-icon locked-icon" />
          <div className="method-details">
            <h4 className="method-title">First Level Maximized</h4>
            <p className="method-description">
              At level 1, you automatically receive the maximum value of your
              hit die (<strong>{hitDie}</strong>).
            </p>
          </div>
        </div>
      ) : (
        // --- LEVEL 2+ (CHOICE) ---
        <div className="hp-choice-grid">
          <button
            className={`hp-method-card ${draft.useAverageHp ? "is-selected" : ""}`}
            onClick={() => onUpdateDraft({ useAverageHp: true })}
          >
            <Calculator size={24} className="method-icon" />
            <div className="method-details">
              <h4 className="method-title">Take the Average</h4>
              <p className="method-description">
                Take the fixed average of {avgHp}. A safe and steady path.
              </p>
            </div>
          </button>

          <button
            className={`hp-method-card ${!draft.useAverageHp ? "is-selected" : ""}`}
            onClick={() =>
              onUpdateDraft({ useAverageHp: false, hpGained: null })
            }
          >
            <Dices size={24} className="method-icon" />
            <div className="method-details">
              <h4 className="method-title">Roll for HP</h4>
              <p className="method-description">
                Test your luck. Roll a d{hitDie} physically or digitally.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* --- MANUAL ROLL INPUT (Conditional) --- */}
      {!isLevelOne && !draft.useAverageHp && (
        <div className="manual-roll-section fadeInDown">
          <label className="manuscript-label">Enter your d{hitDie} roll:</label>
          <input
            type="number"
            className="manuscript-input hp-roll-input"
            value={rawManualRoll}
            onChange={(e) => handleManualChange(e.target.value)}
            min="1"
            max={hitDie}
            placeholder={`1 - ${hitDie}`}
            autoFocus
          />
        </div>
      )}

      {/* --- THE EQUATION DISPLAY --- */}
      <div className="hp-equation-board">
        <h4 className="equation-label">Hit Points Gained</h4>

        <div className="equation-math">
          <div className="math-block">
            <span className="math-value">
              {isLevelOne
                ? hitDie
                : draft.useAverageHp
                  ? avgHp
                  : rawManualRoll || "?"}
            </span>
            <span className="math-caption">
              {draft.useAverageHp || isLevelOne ? "Base" : "Roll"}
            </span>
          </div>

          <span className="math-operator">{conMod >= 0 ? "+" : "-"}</span>

          <div className="math-block">
            <span className="math-value">{Math.abs(conMod)}</span>
            <span className="math-caption">CON Mod</span>
          </div>

          <span className="math-operator">=</span>

          <div className="math-block total-block">
            <Heart size={18} className="total-heart-icon" />
            <span className="math-value total-value">
              {draft.hpGained || "?"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // #endregion
};
