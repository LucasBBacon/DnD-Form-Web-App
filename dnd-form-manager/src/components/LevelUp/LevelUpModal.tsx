import React, { useState, useMemo } from "react";
import "./LevelUpModal.css";
import { getClassById, getSubclassById } from "../../data/staticDataApi";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { LevelUpDraft, LevelUpStepId } from "../../types/levelUpDraft";
import { createEmptyDraft } from "../../types/levelUpDraft";
import { buildLevelUpPlan } from "../../utils/levelUpPlanner";
import { AsiOrFeatStep } from "./steps/AsiOrFeatStep";
import { ClassPickStep } from "./steps/ClassPickStep";
import { FeatureChoiceStep } from "./steps/FeatureChoiceStep";
import { HpGainStep } from "./steps/HpGainStep";
import { ProficiencyChoiceStep } from "./steps/ProficiencyChoiceStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SpellChoiceStep } from "./steps/SpellChoiceStep";
import { SubclassPickStep } from "./steps/SubclassPickStep";

export interface LevelUpModalProps {
  targetLevel: number;
  isBlocking?: boolean;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  targetLevel,
  isBlocking = false,
  onClose,
}) => {
  const {
    classTracks,
    classId,
    subclassId,
    raceId,
    subraceId,
    choicesByLevel,
    commitLevelUpTransaction,
  } = useCharacterStore();

  // Build the initial draft, auto-selecting single-class characters
  const getInitialDraft = (): LevelUpDraft => {
    const draft = createEmptyDraft();
    if (classTracks.length === 1) {
      const track = classTracks[0];
      draft.targetClassId = track.classId;
      draft.isNewMulticlass = false;
      // targetClassLevel = targetLevel for a 1:1 single-class character
      draft.targetClassLevel = targetLevel;
    } else if (classTracks.length === 0 && classId) {
      // Fallback: legacy single-class without explicit tracks
      draft.targetClassId = classId;
      draft.isNewMulticlass = false;
      draft.targetClassLevel = targetLevel;
    }
    return draft;
  };

  const [draft, setDraft] = useState<LevelUpDraft>(getInitialDraft);

  // Derived class/subclass data from the draft
  const classData = draft.targetClassId ? getClassById(draft.targetClassId) : null;
  const currentTrack = classTracks.find((t) => t.classId === draft.targetClassId);
  const effectiveSubclassId = draft.newSubclassId ?? currentTrack?.subclassId ?? subclassId;
  const subclassData = effectiveSubclassId ? getSubclassById(effectiveSubclassId) : null;

  // Recompute the plan whenever the draft changes
  const plan = useMemo(
    () =>
      buildLevelUpPlan({
        targetTotalLevel: targetLevel,
        raceId,
        subraceId,
        classData,
        subclassData,
        classLevel: draft.targetClassLevel,
        choicesByLevel,
        classTracks,
        draft,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, raceId, subraceId, targetLevel],
  );

  const currentStepIndex = plan.orderedSteps.indexOf(draft.currentStepId);

  const goToStep = (stepId: LevelUpStepId) => {
    setDraft((d) => ({ ...d, currentStepId: stepId }));
  };

  const goNext = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < plan.orderedSteps.length) {
      goToStep(plan.orderedSteps[nextIdx]);
    }
  };

  const goPrev = () => {
    const prevIdx = currentStepIndex - 1;
    if (prevIdx >= 0) {
      goToStep(plan.orderedSteps[prevIdx]);
    }
  };

  const updateDraft = (updates: Partial<LevelUpDraft>) => {
    setDraft((d) => ({ ...d, ...updates }));
  };

  const handleCommit = () => {
    if (!plan.isComplete || !draft.targetClassId) return;

    const wasCommitted = commitLevelUpTransaction({
      targetLevel,
      draft,
    });

    if (wasCommitted) {
      onClose();
    }
  };

  const isOnReview = draft.currentStepId === "review";
  const isFirstStep = currentStepIndex === 0;

  const stepProps = { draft, onUpdateDraft: updateDraft, plan, classData, subclassData };

  const renderStep = () => {
    switch (draft.currentStepId) {
      case "class_pick":
        return (
          <ClassPickStep
            {...stepProps}
            targetLevel={targetLevel}
            classTracks={classTracks}
          />
        );
      case "subclass_pick":
        return <SubclassPickStep {...stepProps} />;
      case "hp_gain":
        return <HpGainStep {...stepProps} targetLevel={targetLevel} />;
      case "proficiency_choice":
        return <ProficiencyChoiceStep {...stepProps} />;
      case "asi_or_feat":
        return <AsiOrFeatStep {...stepProps} />;
      case "spell_choice":
        return <SpellChoiceStep {...stepProps} />;
      case "feature_choice":
        return <FeatureChoiceStep {...stepProps} />;
      case "review":
        return (
          <ReviewStep {...stepProps} targetLevel={targetLevel} onConfirm={handleCommit} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal level-up-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Level Up to ${targetLevel}`}
      >
        {/* ── Header ── */}
        <div className="level-up-modal__header">
          <h2 className="level-up-modal__title">Level Up — Level {targetLevel}</h2>
          <button
            type="button"
            className="level-up-modal__close"
            onClick={onClose}
            aria-label="Close"
            disabled={isBlocking}
            title={isBlocking ? "Finish this level-up before closing" : "Close"}
          >
            ✕
          </button>
        </div>

        {isBlocking && (
          <div className="level-up-modal__banner" role="status">
            This level-up must be completed before returning to the character sheet.
          </div>
        )}

        {/* ── Step progress indicator ── */}
        <div className="level-up-modal__steps" aria-hidden="true">
          {plan.orderedSteps.map((stepId, idx) => (
            <div
              key={stepId}
              className={[
                "level-up-modal__step-dot",
                idx < currentStepIndex ? "level-up-modal__step-dot--done" : "",
                idx === currentStepIndex ? "level-up-modal__step-dot--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>

        {/* ── Step content ── */}
        <div className="level-up-modal__content">{renderStep()}</div>

        {/* ── Navigation footer (hidden on review step — it has its own confirm btn) ── */}
        {!isOnReview && (
          <div className="level-up-modal__footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goPrev}
              disabled={isFirstStep}
            >
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={goNext}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
