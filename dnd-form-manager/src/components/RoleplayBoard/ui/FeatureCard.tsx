import type React from "react";
import "./FeatureCard.css";
import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

// #region Interfaces

export interface FeatureSource {
  /** The unique key for the feature source */
  key: string;
  /** The kind of feature source */
  kind: string;
  /** The label for the feature source */
  label: string;
}

interface FeatureCardProps {
  /** Unique ID from schema */
  traitId: string;
  /** The name of the feature */
  name: string;
  /** The sources of the feature */
  sources: FeatureSource[];
  /** The description of the feature */
  lore: {
    shortDescription: string;
    fullText?: string;
  };
  /** Derived from the schema's effects array if the feature has limited uses */
  uses?: {
    maxCount: number;
    resetCondition: "short_rest" | "long_rest" | "turn" | "other";
    currentUses: number;
  };

  /** Callback to increment/decrement uses directly from UI */
  onToggleUse?: (traitId: string, newUseCount: number) => void;
}

// #endregion

// #region Component

export const FeatureCard: React.FC<FeatureCardProps> = ({
  traitId,
  name,
  sources,
  lore,
  uses,
  onToggleUse,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUseClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (!uses || !onToggleUse) return;

    const newCount = index + 1 === uses.currentUses ? index : index + 1;
    onToggleUse(traitId, newCount);
  };

  const formatReset = (reset: string) => {
    return reset.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div
      className={`feature-card-container ${isExpanded ? "expanded" : "collapsed"}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Collapsed Index Row */}
      <div className="feature-header">
        <div className="feature-title-group">
          <div className="feature-drop-cap">{name.charAt(0)}</div>

          <div className="feature-name-block">
            <span className="feature-name">{name}</span>
            {/* Show short desc when collapsed */}
            {!isExpanded && (
              <span className="feature-short-lore">
                {lore.shortDescription}
              </span>
            )}
          </div>
        </div>

        <div className="feature-indicators">
          {/* Marginalia source tags */}
          <div className="source-tags">
            {sources.map((source) => (
              <span
                key={source.key}
                className={`source-tag tag-${source.kind}`}
              >
                {source.label}
              </span>
            ))}
          </div>

          {/* Quick-click uses Tracker */}
          {uses && (
            <div
              className="wax-seal-tracker"
              title={`Resets on ${formatReset(uses.resetCondition)}`}
            >
              {Array.from({ length: uses.maxCount }).map((_, i) => (
                <button
                  key={i}
                  className={`seal-btn ${i < uses.currentUses ? "is-spent" : "is-ready"}`}
                  onClick={(e) => handleUseClick(e, i)}
                  aria-label={`Toggle use ${i + 1}`}
                />
              ))}
            </div>
          )}

          {isExpanded ? (
            <ChevronUp size={16} className="chevron" />
          ) : (
            <ChevronDown size={16} className="chevron" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="feature-details">
          <hr className="filigree-divider" />

          <div className="feature-full-text">
            <ReactMarkdown>
              {lore.fullText ? lore.fullText : lore.shortDescription}
            </ReactMarkdown>
          </div>

          {/* Mechanical Footer */}
          {uses && (
            <div className="feature-mechanics-footer">
              <span className="mechanic-note">
                <RefreshCw size={12} />
                Regains all expended uses after a{" "}
                {formatReset(uses.resetCondition)}.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// #endregion
