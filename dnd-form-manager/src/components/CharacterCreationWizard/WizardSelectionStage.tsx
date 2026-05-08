import type React from "react";
import "./WizardSelectionStage.css";
import { useState } from "react";
import type { SelectionOption, TraitSegment } from "../../types/wizardSelection";

interface WizardSelectionStageProps {
  title: string;
  options: SelectionOption[];
  currentSelectionId: string | null;
  currentSubSelectionId: string | null;
  onSelect: (baseId: string, subId: string | null) => void;
}

export const WizardSelectionStage: React.FC<WizardSelectionStageProps> = ({
  title,
  options,
  currentSelectionId,
  currentSubSelectionId,
  onSelect,
}) => {
  const [expandedId, setExpandedBaseId] = useState<string | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [expandedTraitIndex, setExpandedTraitIndex] = useState<number | null>(
    null,
  );

  const expandedBase = options.find((opt) => opt.id === expandedId);
  const expandedSub = expandedBase?.subOptions?.find(
    (sub) => sub.id === expandedSubId,
  );

  // #region Card Grid

  if (!expandedBase) {
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
                onClick={() => setExpandedBaseId(opt.id)}
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

  // Prepare traits
  let displayTraits: TraitSegment[] = expandedBase.traits.map((t) => ({
    ...t,
    source: "base" as const,
  }));
  if (expandedSub) {
    const subTraits = expandedSub.traits.map((t) => ({
      ...t,
      source: "sub" as const,
    }));
    displayTraits = [...subTraits, ...displayTraits];
  }

  const activeName = expandedSub ? expandedSub.name : expandedBase.name;
  const activeDescription = expandedSub
    ? expandedSub.description
    : expandedBase.description;
  const isCurrentSavedChoice =
    expandedBase.id === currentSelectionId &&
    expandedSub?.id === currentSubSelectionId;

  // Sub-option requirement logic
  const hasSubOptions =
    expandedBase.subOptions && expandedBase.subOptions.length > 0;
  // Disable confirmation if sub-option exists but none is currently selected
  const isConfirmDisabled = hasSubOptions && !expandedSubId;

  let confirmText = "";
  if (isCurrentSavedChoice) {
    confirmText = "CURRENT CHOICE";
  } else if (isConfirmDisabled) {
    confirmText = `SELECT A ${expandedBase.subOptionLabel?.toUpperCase() || "SUB-OPTION"}`;
  } else {
    confirmText = `CHOOSE ${activeName.toUpperCase()}`;
  }

  return (
    <div className="expanded-focus-view">
      {/* Navigation header */}
      <div className="focus-header-bar">
        <button
          className="back-btn"
          onClick={() => {
            if (expandedSubId) {
              setExpandedSubId(null);
            } else {
              setExpandedBaseId(null);
            }
            setExpandedTraitIndex(null);
          }}
        >
          ← Back to {expandedSubId ? expandedBase.name : `${title}s`}
        </button>

        {/* Dynamic confirmation button */}
        <button
          className="confirm-choice-btn"
          disabled={isConfirmDisabled}
          onClick={() => {
            onSelect(expandedBase.id, expandedSub?.id || null);
            // TODO: advance stepper here or let parent handle it
          }}
        >
          {confirmText}
        </button>
      </div>

      <div className="focus-content-scroll">
        {expandedSub && (
          <div className="sub-breadcrumb">
            Base {title}: <strong>{expandedBase.name}</strong>
          </div>
        )}

        <div className="focus-hero">
          <h2 className="focus-title">{activeName}</h2>
          <p className="focus-description">{activeDescription}</p>
        </div>

        {/* Nested sub-options grid */}
        {!expandedSub && hasSubOptions && (
          <div className="sub-options-section">
            <h3 className="traits-header">
              {expandedBase.subOptionLabel || "Sub-option"}
            </h3>
            <p className="sub-options-instruction">
              You must select a{" "}
              {expandedBase.subOptionLabel?.toLowerCase() || "sub-option"} to
              continue.
            </p>
            <div className="options-grid sub-grid">
              {expandedBase.subOptions!.map((sub) => {
                const isSubSelected = sub.id === currentSubSelectionId;
                return (
                  <div
                    key={sub.id}
                    className={`option-card sub-card ${isSubSelected ? "selected" : ""}`}
                    onClick={() => {
                      setExpandedSubId(sub.id);
                      setExpandedTraitIndex(null);
                    }}
                  >
                    {isSubSelected && (
                      <div className="selected-badge">CHOSEN</div>
                    )}
                    <div className="card-footer">
                      <h3 className="card-name">{sub.name}</h3>
                      <p className="card-tagline">{sub.tagline}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <hr className="divider" />

        <h3 className="traits-header">{title} Features</h3>

        {/* Accordion for traits/segments */}
        <div className="traits-accordion-list">
          {displayTraits.map((trait, index) => {
            const isTraitExpanded = expandedTraitIndex === index;
            const isSubTrait = trait.source !== "base";

            return (
              <div
                key={`${trait.name}-${index}`}
                className={`trait-accordion ${isTraitExpanded ? "open" : ""} ${isSubTrait ? "sub-trait-highlight" : ""}`}
              >
                <button
                  className="trait-toggle-btn"
                  onClick={() =>
                    setExpandedTraitIndex(isTraitExpanded ? null : index)
                  }
                >
                  <div className="trait-toggle-text">
                    <div className="trait-title-row">
                      <span className="trait-name">{trait.name}</span>
                      {isSubTrait && <span className="trait-badge sub">Added by {expandedSub?.name}</span>}
                      {trait.isOverride && <span className="trait-badge override">Overrides Base</span>}
                    </div>
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
