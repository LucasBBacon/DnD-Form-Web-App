import type React from "react";
import "./WizardSelectionStage.css";
import { useState } from "react";
import type { SelectionOption } from "../types/wizardSelection";

interface WizardSelectionStageProps {
  title: string;
  options: SelectionOption[];
  onSelect: (id: string) => void;
  currentSelectionId: string | null;
}

export const WizardSelectionStage: React.FC<WizardSelectionStageProps> = ({
  title,
  options,
  onSelect,
  currentSelectionId,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTraitIndex, setExpandedTraitIndex] = useState<number | null>(
    null,
  );

  const expandedOption = options.find((opt) => opt.id === expandedId);

  // #region Card Grid

  if (!expandedOption) {
    return (
      <div className="selection-stage">
        <h2 className="stage-title">Choose your {title}</h2>
        <div className="options-grid">
          {options.map((opt) => {
            const isSelected = opt.id === currentSelectionId;
            return (
              <div
                key={opt.id}
                className={`option-card ${isSelected ? "selected" : ""}`}
                onClick={() => setExpandedId(opt.id)}
              >
                {isSelected && <div className="selected-badge">CHOSEN</div>}
                <div className="card-visual-placeholder">
                  {/* TODO: ADD IMAGE HERE */}
                  <span className="card-initial">{opt.name.charAt(0)}</span>
                </div>
                <div className="card-footer">
                  <h3 className="card-name">{opt.name}</h3>
                  <p className="card-tagline">{opt.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // #endregion

  // #region Expanded focus card
  return (
    <div className="expanded-focus-view">
      {/* Navigation header */}
      <div className="focus-header-bar">
        <button
          className="back-btn"
          onClick={() => {
            setExpandedId(null);
            setExpandedTraitIndex(null);
          }}
        >
          Back to {title}s
        </button>
        <button
          className="confirm-choice-btn"
          onClick={() => {
            onSelect(expandedOption.id);
            // TODO: advance stepper here or let parent handle it
          }}
        >
          {currentSelectionId === expandedOption.id
            ? "CURRENT CHOICE"
            : `CHOOSE ${expandedOption.name.toUpperCase()}`}
        </button>
      </div>

      <div className="focus-content-scroll">
        <div className="focus-hero">
          <h2 className="focus-title">{expandedOption.name}</h2>
          <p className="focus-description">{expandedOption.description}</p>
        </div>

        <hr className="divider" />

        <h3 className="traits-header">{title} Features</h3>

        {/* Accordion for traits/segments */}
        <div className="traits-accordion-list">
          {expandedOption.traits.map((trait, index) => {
            const isTraitExpanded = expandedTraitIndex === index;

            return (
              <div
                key={`${trait.name}-${index}`}
                className={`trait-accordion ${isTraitExpanded ? "open" : ""}`}
              >
                <button
                  className="trait-toggle-btn"
                  onClick={() =>
                    setExpandedTraitIndex(isTraitExpanded ? null : index)
                  }
                >
                  <div className="trait-toggle-text">
                    <span className="trait-name">{trait.name}</span>
                    {!isTraitExpanded && (
                      <span className="trait-short-desc">
                        {trait.shortDescription}
                      </span>
                    )}
                  </div>
                  <span className="toggle-icon">
                    {isTraitExpanded ? "-" : "+"}
                  </span>
                </button>

                {isTraitExpanded && (
                  <div className="trait-full-content">
                    {trait.fullDescription}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
