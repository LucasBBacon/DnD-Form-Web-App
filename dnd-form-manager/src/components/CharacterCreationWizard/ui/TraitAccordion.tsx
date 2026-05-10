import type React from "react";
import type { TraitSegment } from "../../../types/wizardSelection";

interface TraitAccordionProps {
  traits: (TraitSegment & { source?: "base" | "sub"; isOverride?: boolean })[];
  expandedIndex: number | null;
  onToggle: (index: number) => void;
  subName?: string;
}

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
          <button
            className="trait-toggle-btn"
            onClick={() => onToggle(index)}
          >
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
                <span className="trait-short-desc">{trait.shortDescription}</span>
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
