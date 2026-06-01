import type React from "react";
import "./SpellbookRow.css";
import type { SpellbookEntry } from "../Spellbook";
import { useState } from "react";
import { Bookmark, ChevronDown, ChevronUp } from "lucide-react";

interface SpellbookRowProps {
  entry: SpellbookEntry;
  toRomanNumeral: (level: number) => string;
}

export const SpellbookRow: React.FC<SpellbookRowProps> = ({
  entry,
  toRomanNumeral,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { reference, isPrepared, isAlwaysPrepared } = entry;

  // format VSM components
  const componentStrings = [];
  if (reference.components.vocal) componentStrings.push("V");
  if (reference.components.somatic) componentStrings.push("S");
  if (reference.components.material) componentStrings.push("M");
  const componentLabel = componentStrings.join(", ");

  return (
    <div
      className={`spellbook-row-container ${isExpanded ? "is-expanded" : ""}`}
    >
      {/* Summary header */}
      <div
        className="spell-summary-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="spell-level-indicator">
          {reference.level === 0 ? "C" : toRomanNumeral(reference.level)}
        </div>

        <div className="spell-primary-info">
          <span className="spell-name">{reference.name}</span>
          <span className="spell-school-subtext">{reference.school}</span>
        </div>

        <div className="spell-status-flag">
          {isPrepared && (
            <Bookmark
              size={16}
              className={`prepared-icon ${isAlwaysPrepared ? "always-prepared" : ""}`}
            >
              <title>
                {isAlwaysPrepared
                  ? "Domain/Oath Spell (Always Prepared)"
                  : "Prepared"}
              </title>
            </Bookmark>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="spell-details-body">
          <div className="spell-mechanics-grid">
            <div className="mechanic-item">
              <span className="mechanic-label">Casting Time</span>
              <span className="mechanic-value">{reference.castingTime}</span>
            </div>
            <div className="mechanic-item">
              <span className="mechanic-label">Range</span>
              <span className="mechanic-value">{reference.range}</span>
            </div>
            <div className="mechanic-item">
              <span className="mechanic-label">Components</span>
              <span className="mechanic-value">
                {componentLabel}
                {reference.components.material && (
                  <span className="material-text">
                    ({reference.components.material})
                  </span>
                )}
              </span>
            </div>
            <div className="mechanic-item">
              <span className="mechanic-label">Duration</span>
              <span className="mechanic-value">{reference.duration}</span>
            </div>
          </div>

          <hr className="filigree-divider" />

          <div className="spell-description-text">
            <p>{reference.description}</p>

            {reference.highLevelsText && (
              <p className="higher-levels-text">
                <strong>At Higher Levels: </strong> {reference.highLevelsText}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
