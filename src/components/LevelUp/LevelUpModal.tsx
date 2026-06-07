import React, { useState, useMemo, useEffect } from "react";
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
import { ArrowLeft, ArrowRight, BookOpen, Check, X } from "lucide-react";

// #region --- Types and Interfaces ---

export interface LevelUpModalProps {
  // The level the character is leveling up to (e.g. 5 if going from 4 to 5)
  targetLevel: number;
  // If true, the modal cannot be closed until the level-up is completed (e.g. for XP-gated level-ups)
  isBlocking?: boolean;
  // Callback when the modal should be closed (e.g. after successful commit or when user cancels)
  onClose: () => void;
}

// #endregion

/**
 * A multi-step modal dialog that guides the user through the process of leveling up their character.
 */
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

  // Build the initial draft
  const getInitialDraft = (): LevelUpDraft => {
    const draft = createEmptyDraft();
    // If there is only one existing class track, pre-populate the draft to level up that class (common case for early levels)
    if (classTracks.length === 1) {
      const track = classTracks[0];
      draft.targetClassId = track.classId;
      draft.isNewMulticlass = false;
      // targetClassLevel = targetLevel for a 1:1 single-class character
      draft.targetClassLevel = targetLevel;
      // If there are multiple class tracks, the user must explicitly pick which one to level up (multiclass or single-class)
      // leave targetClassId null for the ClassPickStep to handle
    } else if (classTracks.length === 0 && classId) {
      // Fallback: legacy single-class without explicit tracks
      draft.targetClassId = classId;
      draft.isNewMulticlass = false;
      draft.targetClassLevel = targetLevel;
    }
    return draft;
  };

  const [draft, setDraft] = useState<LevelUpDraft>(getInitialDraft);

  // #region --- Get Class and Subclass Data for Plan ---

  const classData = draft.targetClassId
    ? getClassById(draft.targetClassId)
    : null;
  const currentTrack = classTracks.find(
    (t) => t.classId === draft.targetClassId,
  );

  const effectiveSubclassId =
    draft.newSubclassId ?? currentTrack?.subclassId ?? subclassId;
  const subclassData = effectiveSubclassId
    ? getSubclassById(effectiveSubclassId)
    : null;

  // #endregion

  // #region --- Plan Recompute ---

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

  // #endregion

  // #region --- Step Navigation ---

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

  const stepProps = {
    draft,
    onUpdateDraft: updateDraft,
    plan,
    classData,
    subclassData,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isBlocking) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBlocking, onClose]);

  // #endregion

  // #region --- Render ---

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
          <ReviewStep
            {...stepProps}
            targetLevel={targetLevel}
            onConfirm={handleCommit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay fadeIn">
      <div
        className="modal-parchment level-up-modal"
        role="dialog"
        aria-modal="true"
      >
        {/* LEFT PANE - TRACKER */}
        <div className="level-up-sidebar">
          <div className="sidebar-header">
            <BookOpen size={24} className="header-icon" />
            <h2 className="manuscript-section-title">Level {targetLevel}</h2>
            <div className="sidebar-subtitle">Ascension</div>
          </div>

          <nav className="step-tracker">
            {/* TODO: Map over dynamic step plans here */}
            <div className="step-item is-completed">
              <div className="step-node">
                <Check size={12} />
              </div>
              <span className="step-label">Class</span>
            </div>
            <div className="step-item is-active">
              <div className="step-node">
                <span className="node-dot" />
              </div>
              <span className="step-label">Hit Points</span>
            </div>
            <div className="step-item is-locked">
              <div className="step-node" />
              <span className="step-label">Features</span>
            </div>
          </nav>
        </div>

        {/* RIGHT PANE - ACTIVE CONTENT */}
        <div className="level-up-content-area">
          <div className="content-header">
            {!isBlocking && (
              <button
                className="icon-btn close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="step-render-zone custom-scrollbar">
            {renderStep()}
          </div>

          <hr className="ornate-board-divider" />

          {/* FOOTER CONTROLS */}
          <div className="wizard-footer">
            {!isFirstStep && (
              <button className="action-btn cancel-btn" onClick={goPrev}>
                <ArrowLeft size={16} /> Previous
              </button>
            )}

            <div className="footer-spacer" />

            {isOnReview ? (
              <button
                className="action-btn confirm-add-btn destructive-btn"
                onClick={handleCommit}
              >
                Level Up
              </button>
            ) : (
              <button className="action-btn confirm-add-btn" onClick={goNext}>
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // #endregion
};
