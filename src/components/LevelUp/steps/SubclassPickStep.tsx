import React, { useState } from "react";
import "../LevelUpModal.css";
import "./SubclassPickStep.css";
import { getSubclassesForClass } from "../../../data/staticDataApi";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// #region --- Types ---

interface SubclassPickStepProps {
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
 * Step for picking which subclass to choose at a subclass choice level.
 * Only shown if the class being leveled up has a subclass choice at this level.
 */
export const SubclassPickStep: React.FC<SubclassPickStepProps> = ({
  draft,
  onUpdateDraft,
  classData,
}) => {
  const [expandedSubclassId, setExpandedSubclassId] = useState<string | null>(
    null,
  );

  if (!classData) {
    return (
      <div className="step-container error-state">
        <AlertCircle size={24} className="error-icon" />
        <p>Select a class first.</p>
      </div>
    );
  }

  const options = getSubclassesForClass(classData.id);

  const handleSelect = (subclassId: string) => {
    onUpdateDraft({ newSubclassId: subclassId });
  };

  const toggleExpand = (e: React.MouseEvent, subclassId: string) => {
    e.stopPropagation();
    setExpandedSubclassId((prev) => (prev === subclassId ? null : subclassId));
  };

  // #region --- Render ---

  return (
    <div className="step-container subclass-pick-step">
      <div className="step-intro">
        <h3 className="step-title">{classData.name} Specialization</h3>
        <p className="step-description">
          You have reached a turning point in your journey. Choose the specific
          path, archetype, or domain that defines your unique connection to this
          discipline.
        </p>
      </div>

      <div className="subclass-ledger-list">
        {options.map((subclass) => {
          const isSelected = draft.newSubclassId === subclass.id;
          const isExpanded = expandedSubclassId === subclass.id;

          return (
            <div
              key={subclass.id}
              className={`subclass-card ${isSelected ? "is-selected" : ""}`}
              onClick={() => handleSelect(subclass.id)}
            >
              {/* CARD HEADER */}
              <div className="subclass-card-header">
                <div className="subclass-primary-info">
                  <h4 className="subclass-name">{subclass.name}</h4>
                  <p className="subclass-short-desc">
                    {subclass.lore?.shortDescription ||
                      "A specialized path within this discipline."}
                  </p>
                </div>

                <div className="subclass-controls">
                  {/* Selection Indicator */}
                  <div
                    className={`selection-indicator ${isSelected ? "active" : ""}`}
                  >
                    {isSelected && <CheckCircle2 size={20} />}
                  </div>
                </div>
              </div>

              {/* Lore toggle */}
              {subclass.lore?.fullText && (
                <button
                  className="lore-toggle-btn"
                  onClick={(e) => toggleExpand(e, subclass.id)}
                  aria-expanded={isExpanded}
                >
                  <BookOpen size={14} className="lore-icon" />
                  <span>{isExpanded ? "Hide Archives" : "Read Full Lore"}</span>
                  {isExpanded ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
              )}

              {/* EXPANDED LORE */}
              {isExpanded && subclass.lore?.fullText && (
                <div className="subclass-expanded-lore">
                  <hr className="filigree-divider subtle-divider" />
                  <div className="lore-text-content">
                    <p>{subclass.lore.fullText}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {options.length === 0 && (
          <div className="empty-state-text">
            No specializations are currently documented for this discipline.
          </div>
        )}
      </div>
    </div>
  );

  // #endregion
};
