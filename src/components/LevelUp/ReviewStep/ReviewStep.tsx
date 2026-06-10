import React from "react";
import "../LevelUpModal.css";
import "./ReviewStep.css";
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
import {
  Award,
  BookOpen,
  Heart,
  Scroll,
  ShieldAlert,
  Sparkles,
  Swords,
} from "lucide-react";

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

const formatDisplayLabel = (text: string) => {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

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

  const hasErrors = plan.completionErrors && plan.completionErrors.length > 0;
  // #endregion

  // #region --- Render ---

  return (
    <div className="step-container review-step">
      <div className="step-intro">
        <h3 className="step-title">Review Level Up</h3>
        <p className="step-description">
          Review your training decisions. Once complete, these paths will be
          formally woven into your character's ledger.
        </p>
      </div>

      {/* COMPLETION ERROR BANNER */}
      {hasErrors && (
        <div className="error-state review-error-banner">
          <div className="error-banner-header">
            <ShieldAlert size={20} className="error-icon" />
            <span>Unfinished Actions</span>
          </div>
          <ul className="error-list">
            {plan.completionErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="review-manifesto custom-scrollbar">
        <div className="manifesto-inner-border">
          <div className="manifesto-header">
            <Scroll size={28} className="manifesto-icon" />
            <h4 className="manifesto-title">Deeds of Advancement</h4>
            <div className="manifesto-subtitle">
              Character Level {targetLevel}
            </div>
          </div>

          <div className="manifesto-grid">
            {classData && (
              <div className="manifesto-block">
                <div className="block-header">
                  <Swords size={16} /> <span>Core Discipline</span>
                </div>

                <div className="block-row">
                  <span className="row-label">Class Advanced</span>
                  <span className="row-value font-display">
                    {classData.name} (Level {draft.targetClassLevel})
                  </span>
                </div>

                {subclass && (
                  <div className="block-row">
                    <span className="row-label">Specialization</span>
                    <span className="row-value font-display text-gold">
                      {subclass.name}
                    </span>
                  </div>
                )}
                {draft.hpGained !== null && (
                  <div className="block-row">
                    <span className="row-label">Vitality Increase</span>
                    <span className="row-value vital-hp-text">
                      <Heart size={12} fill="var(--rubric-red)" /> +
                      {draft.hpGained} Max HP
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TRAINING & COMPETENCIES */}
            {(draft.skillChoices.length > 0 ||
              draft.toolChoices.length > 0 ||
              draft.languageChoices.length > 0) && (
              <div className="manifesto-block">
                <div className="block-header">
                  <Award size={16} /> <span>New Competencies</span>
                </div>

                {draft.skillChoices.length > 0 && (
                  <div className="block-row is-aligned-top">
                    <span className="row-label">Skills Learned</span>
                    <span className="row-value list-value">
                      {draft.skillChoices.map(formatDisplayLabel).join(", ")}
                    </span>
                  </div>
                )}

                {draft.toolChoices.length > 0 && (
                  <div className="block-row is-aligned-top">
                    <span className="row-label">Tools Mastered</span>
                    <span className="row-value list-value">
                      {draft.toolChoices.map(formatDisplayLabel).join(", ")}
                    </span>
                  </div>
                )}

                {draft.languageChoices.length > 0 && (
                  <div className="block-row is-aligned-top">
                    <span className="row-label">Languages Known</span>
                    <span className="row-value list-value">
                      {draft.languageChoices.map(formatDisplayLabel).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TALENTS & ASI */}
            {(asiSummary || feat || selectedFeatureChoices.length > 0) && (
              <div className="manifesto-block">
                <div className="block-header">
                  <Sparkles size={16} /> <span>Feats & Adaptations</span>
                </div>

                {asiSummary && (
                  <div className="block-row is-aligned-top">
                    <span className="row-label">Attribute Increase</span>
                    <span className="row-value font-display text-red">
                      {asiSummary}
                    </span>
                  </div>
                )}

                {feat && (
                  <div className="block-row is-aligned-top">
                    <span className="row-label">Feat Acquired</span>
                    <span className="row-value list-value text-gold">
                      {feat.name}
                    </span>
                  </div>
                )}

                {selectedFeatureChoices.length > 0 && (
                  <div className="block-row is-aligned-top">
                    <span className="row-label">Features Chosen</span>
                    <span className="row-value list-value">
                      {selectedFeatureChoices.flatMap((str) =>
                        str.split(",").map(formatDisplayLabel).join(", "),
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ARCANE LORE */}
            {allSpells.length > 0 && (
              <div className="manifesto-block">
                <div className="block-header">
                  <BookOpen size={16} /> <span>Mystical Repertoire</span>
                </div>

                <div className="block-row is-aligned-top">
                  <span className="row-label">Incantations Learned</span>
                  <span className="row-value list-value spell-list-glow">
                    {allSpells.map(formatDisplayLabel).join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // #endregion
};
