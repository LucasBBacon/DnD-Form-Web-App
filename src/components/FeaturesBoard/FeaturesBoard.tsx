import type React from "react";
import "./FeaturesBoard.css";
import { FeatureCard, type FeatureCardProps } from "./FeatureCard/FeatureCard";
import { useMemo, useState } from "react";

interface FeaturesBoardProps {
  features: FeatureCardProps[];
}

type FilterKind = "all" | "class" | "race" | "feat" | "background";

export const FeaturesBoard: React.FC<FeaturesBoardProps> = ({ features }) => {
  const [activeFilter, setActiveFilter] = useState<FilterKind>("all");

  const availableFilters = useMemo(() => {
    const kinds = new Set<FilterKind>(["all"]);
    features.forEach((feature) => {
      feature.sources.forEach((source) => {
        kinds.add(source.kind.toLowerCase() as FilterKind);
      });
    });
    return Array.from(kinds);
  }, [features]);

  const displayedFeatures = useMemo(() => {
    if (activeFilter === "all") return features;
    return features.filter((feature) =>
      feature.sources.some(
        (source) => source.kind.toLowerCase() === activeFilter,
      ),
    );
  }, [features, activeFilter]);

  return (
    <div className="features-board-container">
      {/* Filter Glossary (Sticky Header) */}
      <div className="features-glossary-header">
        <h2 className="manuscript-section-title">Features & Traits</h2>

        <div className="glossary-filters">
          {availableFilters.map((filter) => (
            <button
              key={filter}
              className={`filter-pill ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <hr className="ornate-board-divider" />
      </div>

      {/* Scrollable Feature List */}
      <div className="features-scroll-area">
        {displayedFeatures.length > 0 ? (
          <div className="features-list">
            {displayedFeatures.map((feature) => (
              <FeatureCard key={feature.traitId} {...feature} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-text">
              No features found for this category...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
