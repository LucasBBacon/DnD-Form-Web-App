import React, { useState } from "react";
import "../LevelUpModal.css";
import "./AsiOrFeatStep.css";
import { getAllFeats } from "../../../data/staticDataApi";
import type { Ability } from "../../../types/common";
import { ABILITIES_KEY_LABEL } from "../../../utils/abilityConstants";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import { formatFeatPrerequisites, isFeatEligible } from "../../../utils/featUtils";
import { useCharacterStats } from "../../../hooks/useCharacterStats";
import { useCharacterStore } from "../../../store/useCharacterStore";
import {
  ArrowUpCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

// #region --- Types ---

interface AsiOrFeatStepProps {
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
}

// #endregion

/**
 * Step for choosing whether to take an ability score improvement or a feat at a level that grants that choice.
 * Only shown if the level being planned has an ASI/feat choice.
 * @param param0 Props for the ASI or Feat step
 * @returns JSX element for the ASI or Feat step
 */
export const AsiOrFeatStep: React.FC<AsiOrFeatStepProps> = ({
  draft,
  onUpdateDraft,
}) => {
  // #region --- State and Data ---

  const { abilities } = useCharacterStats();
  const {
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
    choicesByLevel,
    acquiredFeats,
  } = useCharacterStore();

  const totalScores = abilities.scores;

  const isAsiMode = !draft.featId;
  const usedPoints = Object.values(draft.asiChoices).reduce(
    (s, v) => s + (v ?? 0),
    0,
  );
  const remainingPoints = 2 - usedPoints;

  const handleSetAsiMode = () => {
    onUpdateDraft({ featId: null });
  };

  const handleSetFeatMode = () => {
    onUpdateDraft({ asiChoices: {} });
  };

  const handleAsiChange = (ability: Ability, delta: number) => {
    const current = draft.asiChoices[ability] ?? 0;
    const newVal = current + delta;
    if (newVal < 0) return;
    if (delta > 0 && remainingPoints <= 0) return;
    if (totalScores[ability] + newVal > 20) return;
    onUpdateDraft({ asiChoices: { ...draft.asiChoices, [ability]: newVal } });
  };

  const eligibleFeats = getAllFeats().filter((feat) =>
    isFeatEligible(feat, {
      level,
      raceId,
      subraceId,
      classId,
      subclassId,
      totalScores,
      choicesByLevel,
      acquiredFeats,
    }),
  );

  // #endregion

  const [featSearch, setFeatSearch] = useState("");
  const [expandedFeatId, setExpandedFeatId] = useState<string | null>(null);

  const filteredFeats = eligibleFeats.filter((f) =>
    f.name.toLowerCase().includes(featSearch.toLowerCase()),
  );

  const toggleFeatExpand = (e: React.MouseEvent, featId: string) => {
    e.stopPropagation();
    setExpandedFeatId((prev) => (prev === featId ? null : featId));
  };

  // #region --- Render ---

  return (
    <div className="step-container asi-feat-step">
      <div className="step-intro">
        <h3 className="step-title">Power & Progression</h3>
        <p className="step-description">
          Your experiences have tempered you. Choose to increase your core
          attributes or master a new, specialized feat.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mode-toggle-grid">
        <button
          className={`mode-card ${isAsiMode ? "is-selected" : ""}`}
          onClick={handleSetAsiMode}
        >
          <ArrowUpCircle size={24} className="mode-icon" />
          <span className="mode-title">Ability Score Increase</span>
          <span className="mode-desc">
            Add +2 to one score, or +1 to two scores (Max 20).
          </span>
        </button>

        <button
          className={`mode-card ${!isAsiMode ? "is-selected" : ""}`}
          onClick={handleSetFeatMode}
        >
          <Sparkles size={24} className="mode-icon" />
          <span className="mode-title">Acquire a Feat</span>
          <span className="mode-desc">
            Gain an unique talent or area of expertise.
          </span>
        </button>

        <hr className="filigree-divider subtle-divider" />
      </div>

      {/* RENDER ASI EDITOR */}
      {isAsiMode && (
        <div className="asi-editor-section fadeIn">
          <div className="asi-header">
            <span className="asi-instruction">Allocate your points:</span>
            <div
              className={`points-counter ${remainingPoints === 0 ? "is-complete" : ""}`}
            >
              Remaining: <span className="points-value">{remainingPoints}</span>
            </div>
          </div>

          <div className="asi-attributes-list">
            {ABILITIES_KEY_LABEL.map(({ key, label }) => {
              const baseScore = totalScores[key];
              const allocated = draft.asiChoices[key] ?? 0;
              const finalScore = baseScore + allocated;
              const isMaxedOut = finalScore >= 20;

              return (
                <div
                  key={key}
                  className={`asi-row ${allocated > 0 ? "has-points" : ""} ${isMaxedOut ? "is-maxed" : ""}`}
                >
                  <div className="asi-row-label">
                    <span className="attr-name">{label}</span>
                    {isMaxedOut && <span className="max-badge">Max</span>}
                  </div>

                  <div className="asi-row-controls">
                    <span className="base-score">{baseScore}</span>
                    <span className="arrow-spacer">→</span>

                    <div className="stepper-control">
                      <button
                        className="stepper-btn"
                        disabled={allocated == 0}
                        onClick={() => handleAsiChange(key, -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        className={`stepper-value ${allocated > 0 ? "active" : ""}`}
                      >
                        +{allocated}
                      </span>
                      <button
                        className="stepper-btn"
                        disabled={remainingPoints === 0 || isMaxedOut}
                        onClick={() => handleAsiChange(key, 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="arrow-spacer">=</span>
                    <span
                      className={`final-score ${allocated > 0 ? "improved" : ""}`}
                    >
                      {finalScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER FEAT PICKER */}
      {!isAsiMode && (
        <div className="feat-picker-section fadeIn">
          <div className="requisition-search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="manuscript-input full-width"
              placeholder="Search available feats..."
              value={featSearch}
              onChange={(e) => setFeatSearch(e.target.value)}
            />
          </div>

          <div className="feat-ledger-list custom-scrollbar">
            {filteredFeats.map((feat) => {
              const isSelected = draft.featId === feat.id;
              const isExpanded = expandedFeatId === feat.id;

              return (
                <div
                  key={feat.id}
                  className={`subclass-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onUpdateDraft({ featId: feat.id })}
                >
                  <div className="subclass-card-header">
                    <div className="subclass-primary-info">
                      <h4 className="subclass-name">{feat.name}</h4>
                      {feat.prerequisites && (
                        <span className="feat-prerequisite">
                          {formatFeatPrerequisites(feat)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`selection-indicator ${isSelected ? "active" : ""}`}
                    >
                      {isSelected && <CheckCircle2 size={20} />}
                    </div>
                  </div>

                  <button
                    className="lore-toggle-btn"
                    onClick={(e) => toggleFeatExpand(e, feat.id)}
                  >
                    <BookOpen size={14} className="lore-icon" />
                    <span>
                      {isExpanded ? "Hide Details" : "Read Description"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="subclass-expanded-lore">
                      <hr className="filigree-divider subtle-divider" />
                      <div className="lore-text-content">
                        <p>{feat.lore.shortDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFeats.length === 0 && (
              <div className="empty-state-text">
                No feats match your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // #endregion
};
