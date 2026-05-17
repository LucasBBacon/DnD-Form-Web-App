import type React from "react";
import "./SpellLevelSelector.css";

export interface SpellLevelSelectorProps {
  /** Spell's base level */
  baseLevel: number;
  /** Available spell levels for upcasting */
  availableLevels: number[];
  /** Currently selected cast level */
  selectedLevel: number;
  /** Currently selected pool (shared or pact) */
  selectedPool: "shared" | "pact";
  /** Whether a shared slot is available at the selected level */
  canUseShared: boolean;
  /** Whether a pact slot is available at the selected level */
  canUsePact: boolean;
  /** Callback when the cast level changes */
  onLevelChange: (level: number) => void;
  /** Callback when the pool selection changes */
  onPoolChange: (pool: "shared" | "pact") => void;
  /** Optional callback to format level as text (e.g., ordinal) */
  formatLevel?: (level: number) => string;
}

/**
 * Component for selecting spell cast level and slot pool.
 * Displays available levels and pool options, allowing the player to choose
 * which slot pool to use for casting (if multiple are available).
 */
export const SpellLevelSelector: React.FC<SpellLevelSelectorProps> = ({
  baseLevel,
  availableLevels,
  selectedLevel,
  selectedPool,
  canUseShared,
  canUsePact,
  onLevelChange,
  onPoolChange,
  formatLevel = (l) => `Level ${l}`,
}) => {
  // Don't show selector for cantrips or single-level spells
  if (baseLevel === 0 || availableLevels.length <= 1) {
    return null;
  }

  const availablePools: Array<"shared" | "pact"> = [];
  if (canUseShared) availablePools.push("shared");
  if (canUsePact) availablePools.push("pact");

  return (
    <div className="spell-level-selector">
      {/* Level Selector */}
      <div className="selector-group">
        <label className="selector-label">Cast Level:</label>
        <div className="level-buttons">
          {availableLevels.map((level) => (
            <button
              key={level}
              className={`level-btn ${selectedLevel === level ? "active" : ""}`}
              onClick={() => onLevelChange(level)}
              title={`Cast at ${formatLevel(level)}`}
            >
              {formatLevel(level)}
            </button>
          ))}
        </div>
      </div>

      {/* Pool Selector - only show if multiple pools are available */}
      {availablePools.length > 1 && (
        <div className="selector-group">
          <label className="selector-label">Slot Pool:</label>
          <div className="pool-buttons">
            {availablePools.map((pool) => (
              <button
                key={pool}
                className={`pool-btn ${selectedPool === pool ? "active" : ""}`}
                onClick={() => onPoolChange(pool)}
                title={`Use ${pool} slot`}
              >
                {pool === "shared" ? "Shared Slot" : "Pact Slot"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
