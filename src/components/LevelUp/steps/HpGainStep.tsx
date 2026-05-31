import React, { useEffect } from "react";
import type { ClassData } from "../../../types/class";
import type { HitDie } from "../../../types/common";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import { useCharacterStats } from "../../../hooks/useCharacterStats";

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
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      const withMod = Math.max(1, parsed + conMod);
      onUpdateDraft({ hpGained: withMod });
    }
  };

  // #endregion

  // #region --- Render ---

  return (
    <div className="level-up-step">
      <h3 className="level-up-step__title">Hit Points</h3>
      <p className="level-up-step__description">
        {isLevelOne
          ? `At level 1 you receive the maximum value of your hit die.`
          : `Roll your hit die or take the average to determine HP gained this level.`}
        {` Constitution modifier (${conMod >= 0 ? `+${conMod}` : conMod}) is applied automatically.`}
      </p>

      <div className="hp-step__die-display">d{hitDie}</div>

      {isLevelOne ? (
        <p className="hp-step__result">
          {hitDie} (max) {conMod !== 0 && `${conMod >= 0 ? "+" : ""}${conMod}`}{" "}
          = <strong>{computedHp}</strong> HP
        </p>
      ) : (
        <>
          {/* Average option */}
          <label
            className={`level-up-step__option ${draft.useAverageHp ? "level-up-step__option--selected" : ""}`}
          >
            <input
              type="radio"
              name="hp-mode"
              checked={draft.useAverageHp}
              onChange={() => onUpdateDraft({ useAverageHp: true })}
            />
            <span>
              <span className="level-up-step__option-label">
                Use average — {avgHp}{" "}
                {conMod !== 0 && `${conMod >= 0 ? "+" : ""}${conMod}`} ={" "}
                {computedHp} HP
              </span>
              <br />
              <span className="level-up-step__option-hint">
                Recommended for most players
              </span>
            </span>
          </label>

          {/* Manual roll option */}
          <label
            className={`level-up-step__option ${!draft.useAverageHp ? "level-up-step__option--selected" : ""}`}
            style={{ marginTop: "0.5rem" }}
          >
            <input
              type="radio"
              name="hp-mode"
              checked={!draft.useAverageHp}
              onChange={() =>
                onUpdateDraft({ useAverageHp: false, hpGained: null })
              }
            />
            <span>
              <span className="level-up-step__option-label">
                Enter a roll manually
              </span>
              <br />
              <span className="level-up-step__option-hint">
                Enter the die result (1–{hitDie})
              </span>
            </span>
          </label>

          {!draft.useAverageHp && (
            <div
              className="level-up-step__row"
              style={{ marginTop: "0.75rem" }}
            >
              <label htmlFor="hp-roll-input" style={{ fontSize: "0.875rem" }}>
                Rolled value (1–{hitDie}):
              </label>
              <input
                id="hp-roll-input"
                type="number"
                className="level-up-step__inline-number"
                min={1}
                max={hitDie}
                onChange={(e) => handleManualChange(e.target.value)}
              />
              {draft.hpGained !== null && (
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text, #eee)",
                  }}
                >
                  → {draft.hpGained} HP total
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  // #endregion
};
