import type React from "react";
import "./FeatureCard.css";

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
  /** The name of the feature */
  name: string;
  /** The sources of the feature */
  sources: FeatureSource[];
  /** The description of the feature */
  description: string;
}

// #endregion

// #region Component

export const FeatureCard: React.FC<FeatureCardProps> = ({
  name,
  sources,
  description,
}) => (
  <div className="feature-card">
    <div className="feature-header">
      <span className="feature-name">{name}</span>
      <span className="feature-source" aria-label="Feature sources">
        {sources.map((source) => (
          <span
            key={source.key}
            className={`feature-source-badge feature-source-badge--${source.kind}`}
          >
            {source.label}
          </span>
        ))}
      </span>
    </div>
    <div className="feature-description">{description}</div>
  </div>
);

// #endregion
