import React, { useState } from "react";
import "../LevelUpModal.css";
import "./FeatureChoiceStep.css";
import { getTraitById } from "../../../data/staticDataApi";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  PenTool,
  Sparkles,
} from "lucide-react";
import type { PendingFeatureChoice } from "../../../utils/choiceUtils";

// #region --- Types ---

interface FeatureChoiceStepProps {
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

// #region --- Utilities ---

const formatFallbackName = (id: string) => {
  return id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// #endregion

function FeatureChoiceGroup({
  choiceConfig,
  currentSelectionString,
  onChange,
}: {
  choiceConfig: PendingFeatureChoice;
  currentSelectionString: string | undefined;
  onChange: (nextStr: string) => void;
}) {
  const { sourceId, sourceName, count, pool, allowCustomValue } = choiceConfig;

  const selected = currentSelectionString
    ? currentSelectionString.split(",")
    : [];
  const isMaxReached = selected.length >= count;

  const existingCustomValue = selected.find((val) => !pool.includes(val)) || "";
  const [customInput, setCustomInput] = useState(existingCustomValue);

  const [expandedTraitId, setExpandedTraitId] = useState<string | null>(null);

  const togglePreset = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id).join(","));
    } else if (!isMaxReached) {
      onChange([...selected, id].join(","));
    }
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedTraitId((prev) => (prev === id ? null : id));
  };

  const handleCustomSubmit = (
    e:
      | React.FocusEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if ("key" in e && e.key !== "Enter") return;
    const val = customInput.trim();
    const withoutCustom = selected.filter((s) => pool.includes(s));

    if (val === "") {
      onChange(withoutCustom.join(","));
    } else if (withoutCustom.length < count) {
      onChange([...withoutCustom, val].join(","));
    }
  };

  return (
    <div className="proficiency-choice-group feature-choice-group">
      <div className="choice-group-header">
        <div className="group-title-area">
          <span className="group-source-label">Source: {sourceName}</span>
          <span className="group-instruction">
            Select {count} Option{count > 1 ? "s" : ""}
          </span>
        </div>
        <div className={`choice-counter ${isMaxReached ? "is-complete" : ""}`}>
          {selected.length} / {count}
          {isMaxReached && <CheckCircle2 size={16} className="complete-icon" />}
        </div>
      </div>

      <div className="feature-options-stack">
        {/* PRESET POOL */}
        {pool.map((optionId) => {
          const isSelected = selected.includes(optionId);
          const isLockedOut = isMaxReached && !isSelected;
          const isExpanded = expandedTraitId === optionId;

          const trait = getTraitById(optionId);
          const displayName = trait ? trait.name : formatFallbackName(optionId);
          const shortDesc = trait?.lore.shortDescription;
          const fullText = trait?.lore.fullText;

          return (
            <div
              key={optionId}
              className={`feature-card subclass-card ${isSelected ? "is-selected" : ""} ${isLockedOut ? "is-locked-out" : ""}`}
              onClick={() => !isLockedOut && togglePreset(optionId)}
            >
              <div className="subclass-card-header">
                <div className="subclass-primary-info">
                  <h4 className="subclass-name feature-name">{displayName}</h4>
                  {shortDesc && (
                    <p className="subclass-short-desc">{shortDesc}</p>
                  )}
                </div>

                <div className="feature-controls">
                  {isLockedOut && <Lock size={16} className="lock-icon" />}
                  <div
                    className={`selection-indicator ${isSelected ? "active" : ""}`}
                  >
                    {isSelected && <CheckCircle2 size={20} />}
                  </div>
                </div>
              </div>

              {fullText && (
                <button
                  className="lore-toggle-btn"
                  onClick={(e) => toggleExpand(e, optionId)}
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

                  {isExpanded && fullText && (
                    <div className="subclass-expanded-lore">
                      <hr className="filigree-divider subtle-divider" />
                      <div className="lore-text-content">
                        <p>{fullText}</p>
                      </div>
                    </div>
                  )}
                </button>
              )}
            </div>
          );
        })}

        {/* CUSTOM INPUT BOX */}
        {allowCustomValue && (
          <div
            className={`feature-card custom-value-card ${existingCustomValue ? "is-selected" : ""} ${isMaxReached && !existingCustomValue ? "is-locked-out" : ""}`}
          >
            <div className="custom-vale-header">
              <div
                className={`wax-seal-indicator ${existingCustomValue ? "is-filled" : "is-empty"}`}
              >
                {existingCustomValue ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <PenTool size={10} />
                )}
              </div>
              <input
                type="text"
                className="manuscript-input custom-feature-input"
                placeholder="Enter a custom specialized choice..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onBlur={handleCustomSubmit}
                onKeyDown={handleCustomSubmit}
                disabled={isMaxReached && !existingCustomValue}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const FeatureChoiceStep: React.FC<FeatureChoiceStepProps> = ({
  draft,
  onUpdateDraft,
  plan,
}) => {
  const { pendingFeatureChoices } = plan;

  if (!pendingFeatureChoices || pendingFeatureChoices.length === 0) {
    return (
      <div className="step-container empty-state-container">
        <Sparkles size={32} className="empty-state-icon" />
        <h3 className="empty-state-title">No Feature Decisions</h3>
        <p className="empty-state-text">
          Your path forward is clear. You automatically gain the standard
          features of this level without needing to make specialized choices.
        </p>
      </div>
    );
  }

  const setChoiceValue = (sourceId: string, value: string) => {
    onUpdateDraft({
      featureChoices: {
        ...draft.featureChoices,
        [sourceId]: value,
      },
    });
  };

  // #region --- Render ---

  return (
    <div className="step-container feature-choice-step">
      <div className="step-intro">
        <h3 className="step-title">Feature Choices</h3>
        <p className="step-description">
          Customize your progression by selecting specific traits, fighting
          styles, or esoteric invocations.
        </p>
      </div>

      <div className="feature-ledgers custom-scrollbar">
        {pendingFeatureChoices.map((choice) => (
          <FeatureChoiceGroup
            key={choice.sourceId}
            choiceConfig={choice}
            currentSelectionString={draft.featureChoices[choice.sourceId]}
            onChange={(nextStr) => setChoiceValue(choice.sourceId, nextStr)}
          />
        ))}
      </div>
    </div>
  );

  // #endregion
};
