import type React from "react";
import "./TraitAccordion.css";
import type { TraitSegment } from "../../../types/wizardSelection";

// #region Interface

interface TraitAccordionProps {
  /** The list of traits to display in the accordion */
  traits: (
    TraitSegment & {
      /** The source of the trait, either "base" or "sub" */
      source?: "base" | "sub"; 
      /** Indicates if the trait overrides a base trait */
      isOverride?: boolean 
    }
  )[];
  /** The index of the currently expanded trait, or null if none are expanded */
  expandedIndex: number | null;
  /** Callback function to handle toggling a trait's expanded state */
  onToggle: (index: number) => void;
  /** Optional name of the subclass or source adding the trait */
  subName?: string;
}

// #endregion

//#region Component

export const TraitAccordion: React.FC<TraitAccordionProps> = ({
  traits,
  expandedIndex,
  onToggle,
  subName,
}) => (
  <div className="traits-accordion-list">
    {traits.map((trait, index) => {
      const isTraitExpanded = expandedIndex === index;
      const isSubTrait = trait.source !== "base";

      return (
        <div
          key={`${trait.name}-${index}`}
          className={`trait-accordion ${isTraitExpanded ? "open" : ""} ${isSubTrait ? "sub-trait-highlight" : ""}`}
        >
          <button className="trait-toggle-btn" onClick={() => onToggle(index)}>
            <div className="trait-toggle-text">
              <div className="trait-title-row">
                <span className="trait-name">{trait.name}</span>
                {isSubTrait && subName && (
                  <span className="trait-badge sub">Added by {subName}</span>
                )}
                {trait.isOverride && (
                  <span className="trait-badge override">Overrides Base</span>
                )}
              </div>
              {!isTraitExpanded && (
                <span className="trait-short-desc">
                  {trait.shortDescription}
                </span>
              )}
            </div>
            <span className="toggle-icon">{isTraitExpanded ? "-" : "+"}</span>
          </button>

          {isTraitExpanded && (
            <div className="trait-full-content">{trait.fullDescription}</div>
          )}
        </div>
      );
    })}
  </div>
);

// #endregion
