import type React from "react";
import "./WizardSelectionStage.css";
import type { SelectionOption, TraitSegment } from "../../types/wizardSelection";
import { OptionCard } from "./ui/OptionCard";
import { TraitAccordion } from "./ui/TraitAccordion";

export interface WizardSelectionStageViewProps {
  title: string;
  options: SelectionOption[];
  currentSelectionId: string | null;
  currentSubSelectionId: string | null;
  expandedBaseId: string | null;
  expandedSubId: string | null;
  expandedTraitIndex: number | null;
  onExpandedBaseIdChange: (id: string | null) => void;
  onExpandedSubIdChange: (id: string | null) => void;
  onExpandedTraitIndexChange: (index: number | null) => void;
  onSelect: (baseId: string, subId: string | null) => void;
}

export const WizardSelectionStageView: React.FC<WizardSelectionStageViewProps> = ({
  title,
  options,
  currentSelectionId,
  currentSubSelectionId,
  expandedBaseId,
  expandedSubId,
  expandedTraitIndex,
  onExpandedBaseIdChange,
  onExpandedSubIdChange,
  onExpandedTraitIndexChange,
  onSelect,
}) => {
  const expandedBase = options.find((opt) => opt.id === expandedBaseId);
  const expandedSub = expandedBase?.subOptions?.find((sub) => sub.id === expandedSubId);

  if (!expandedBase) {
    return (
      <div className="selection-stage">
        <h2 className="stage-title">Choose your {title}</h2>
        <div className="options-grid">
          {options.map((opt) => (
            <OptionCard
              key={opt.id}
              option={opt}
              isSelected={opt.id === currentSelectionId}
              onClick={() => onExpandedBaseIdChange(opt.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  let displayTraits: TraitSegment[] = expandedBase.traits.map((trait) => ({
    ...trait,
    source: "base" as const,
  }));
  if (expandedSub) {
    const subTraits = expandedSub.traits.map((trait) => ({
      ...trait,
      source: "sub" as const,
    }));
    displayTraits = [...subTraits, ...displayTraits];
  }

  const activeName = expandedSub ? expandedSub.name : expandedBase.name;
  const activeDescription = expandedSub ? expandedSub.description : expandedBase.description;
  const isCurrentSavedChoice =
    expandedBase.id === currentSelectionId && expandedSub?.id === currentSubSelectionId;

  const hasSubOptions = !!expandedBase.subOptions && expandedBase.subOptions.length > 0;
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
      <div className="focus-header-bar">
        <button
          className="back-btn"
          onClick={() => {
            if (expandedSubId) {
              onExpandedSubIdChange(null);
            } else {
              onExpandedBaseIdChange(null);
            }
            onExpandedTraitIndexChange(null);
          }}
        >
          {`← Back to ${expandedSubId ? expandedBase.name : `${title}s`}`}
        </button>

        <button
          className="confirm-choice-btn"
          disabled={isConfirmDisabled}
          onClick={() => {
            onSelect(expandedBase.id, expandedSub?.id || null);
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

        {!expandedSub && hasSubOptions && (
          <div className="sub-options-section">
            <h3 className="traits-header">{expandedBase.subOptionLabel || "Sub-option"}</h3>
            <p className="sub-options-instruction">
              You must select a {expandedBase.subOptionLabel?.toLowerCase() || "sub-option"} to continue.
            </p>
            <div className="options-grid sub-grid">
              {expandedBase.subOptions!.map((sub) => {
                const isSubSelected = sub.id === currentSubSelectionId;
                return (
                  <div
                    key={sub.id}
                    className={`option-card sub-card ${isSubSelected ? "selected" : ""}`}
                    onClick={() => {
                      onExpandedSubIdChange(sub.id);
                      onExpandedTraitIndexChange(null);
                    }}
                  >
                    {isSubSelected && <div className="selected-badge">CHOSEN</div>}
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

        <TraitAccordion
          traits={displayTraits}
          expandedIndex={expandedTraitIndex}
          onToggle={(index) =>
            onExpandedTraitIndexChange(expandedTraitIndex === index ? null : index)
          }
          subName={expandedSub?.name}
        />
      </div>
    </div>
  );
};
