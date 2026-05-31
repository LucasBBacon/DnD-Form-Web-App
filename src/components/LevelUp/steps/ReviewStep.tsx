import React from "react";
import {
  getClassById,
  getFeatById,
  getSpellByID,
  getSubclassById,
} from "../../../data/staticDataApi";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";

// #region --- Types ---

interface ReviewStepProps {
  /** The current draft of the level-up process */
  draft: LevelUpDraft;
  /** Function to update the draft with new values */
  onUpdateDraft: (updates: Partial<LevelUpDraft>) => void;
  /** The result of the level-up planning process */
  plan: LevelUpPlannerResult;
  /** Data for the currently selected class */
  classData: ClassData | null;
  /** Data for the currently selected subclass */
  subclassData: SubclassData | null;
  /** The target level for the level-up */
  targetLevel: number;
  /** Function to confirm the level-up choices */
  onConfirm: () => void;
}

// #endregion

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="review-step__row">
      <span className="review-step__label">{label}</span>
      <span className="review-step__value">{value}</span>
    </div>
  );
}

/**
 * Final review step showing a summary of all the choices made during the level-up process, along with any unmet requirements.
 * @param param0 The props for the ReviewStep component
 * @returns A React element representing the review step
 */
export const ReviewStep: React.FC<ReviewStepProps> = ({
  draft,
  plan,
  targetLevel,
  onConfirm,
}) => {

  // #region --- Data Preparation ---

  const classData = draft.targetClassId
    ? getClassById(draft.targetClassId)
    : null;
  const subclass = draft.newSubclassId
    ? getSubclassById(draft.newSubclassId)
    : null;
  const feat = draft.featId ? getFeatById(draft.featId) : null;

  const asiSummary = Object.entries(draft.asiChoices)
    .filter(([, v]) => (v ?? 0) > 0)
    .map(([ability, points]) => `+${points} ${ability.toUpperCase()}`)
    .join(", ");

  const allSpells = [...draft.cantripsLearned, ...draft.spellsLearned];
  const selectedFeatureChoices = Object.values(draft.featureChoices);

  // #endregion

  // #region --- Render ---

  return (
    <div className="level-up-step">
      <h3 className="level-up-step__title">Review Level Up</h3>
      <p className="level-up-step__description">
        Confirm your choices. Click Back to adjust anything.
      </p>

      <ReviewRow label="Character Level" value={targetLevel} />
      <ReviewRow
        label="Class Leveled"
        value={
          classData
            ? `${classData.name} → Level ${draft.targetClassLevel}${draft.isNewMulticlass ? " (new)" : ""}`
            : "—"
        }
      />
      {draft.hpGained !== null && (
        <ReviewRow label="HP Gained" value={`+${draft.hpGained}`} />
      )}
      {subclass && <ReviewRow label="Subclass" value={subclass.name} />}
      {feat && <ReviewRow label="Feat" value={feat.name} />}
      {asiSummary && <ReviewRow label="ASI" value={asiSummary} />}
      {draft.skillChoices.length > 0 && (
        <ReviewRow
          label="Skill Proficiencies"
          value={draft.skillChoices.map((s) => s.replace(/_/g, " ")).join(", ")}
        />
      )}
      {draft.weaponChoices.length > 0 && (
        <ReviewRow
          label="Weapon Proficiencies"
          value={draft.weaponChoices.join(", ")}
        />
      )}
      {draft.toolChoices.length > 0 && (
        <ReviewRow
          label="Tool Proficiencies"
          value={draft.toolChoices.join(", ")}
        />
      )}
      {draft.languageChoices.length > 0 && (
        <ReviewRow label="Languages" value={draft.languageChoices.join(", ")} />
      )}
      {allSpells.length > 0 && (
        <ReviewRow label="Spells Learned" value={allSpells.join(", ")} />
      )}
      {selectedFeatureChoices.length > 0 && (
        <ReviewRow
          label="Feature Choices"
          value={selectedFeatureChoices
            .map(
              (value) => getSpellByID(value)?.name ?? value.replace(/_/g, " "),
            )
            .join(", ")}
        />
      )}

      {!plan.isComplete && (
        <div className="level-up-step__error-list" role="alert">
          <p className="level-up-step__unmet-title">Unmet requirements</p>
          <ul>
            {plan.completionErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
          <p className="level-up-step__option-hint">
            Use Back to complete the missing selections, then return here to
            confirm.
          </p>
        </div>
      )}

      <button
        type="button"
        className="level-up-step__confirm-btn"
        disabled={!plan.isComplete}
        onClick={onConfirm}
      >
        Confirm Level Up
      </button>
    </div>
  );

  // #endregion
};
