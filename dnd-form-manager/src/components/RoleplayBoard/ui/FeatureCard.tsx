import type React from "react";
import "./FeatureCard.css"

export interface FeatureSource {
  key: string;
  kind: string;
  label: string;
}

interface FeatureCardProps {
  name: string;
  sources: FeatureSource[];
  description: string;
}

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
