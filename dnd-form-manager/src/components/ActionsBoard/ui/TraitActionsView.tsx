import type React from "react";
import { useState } from "react";
import type { ActionData } from "../../../types/action";

interface TraitActionsViewProps {
  actions: ActionData[];
}

const toTitleCase = (value: string): string =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatRange = (action: ActionData): string => {
  const { range } = action;

  if (!range) return "N/A";
  if (range.type === "self") return "Self";
  if (range.type === "touch") return "Touch";

  const minDistance =
    typeof range.distance === "number" ? `${range.distance} ft` : "";
  const maxDistance =
    typeof range.maxDistance === "number" ? `${range.maxDistance} ft` : "";

  if (minDistance && maxDistance) {
    return `${toTitleCase(range.type)} ${minDistance}/${maxDistance}`;
  }

  if (minDistance) {
    return `${toTitleCase(range.type)} ${minDistance}`;
  }

  return toTitleCase(range.type);
};

const formatDamageSummary = (action: ActionData): string | null => {
  const damage = action.output?.damage;
  if (!damage || damage.length === 0) return null;

  return damage.map((entry) => `${entry.roll} ${entry.type}`).join(", ");
};

export const TraitActionsView: React.FC<TraitActionsViewProps> = ({
  actions,
}) => {
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

  if (actions.length === 0) {
    return (
      <div className="empty-state">No trait-granted actions available.</div>
    );
  }

  return (
    <div className="trait-actions-list">
      {actions.map((action) => {
        const isExpanded = expandedActionId === action.id;
        const damageSummary = formatDamageSummary(action);

        return (
          <div
            key={action.id}
            className={`trait-action-card ${isExpanded ? "expanded" : ""}`}
          >
            <button
              className="trait-action-header"
              onClick={() =>
                setExpandedActionId((prev) =>
                  prev === action.id ? null : action.id,
                )
              }
            >
              <span className="trait-action-name">{action.name}</span>
              <div className="trait-action-quick-stats">
                <span className="quick-stat">
                  {toTitleCase(action.activation.actionType)}
                </span>
                <span className="quick-stat">{formatRange(action)}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="trait-action-details">
                <div className="trait-action-meta-grid">
                  <div className="meta-item">
                    <strong>Activation:</strong>{" "}
                    {toTitleCase(action.activation.actionType)}
                  </div>
                  {action.activation.condition && (
                    <div className="meta-item">
                      <strong>Trigger:</strong> {action.activation.condition}
                    </div>
                  )}
                  <div className="meta-item">
                    <strong>Range:</strong> {formatRange(action)}
                  </div>
                  {action.areaOfEffect && (
                    <div className="meta-item">
                      <strong>Area:</strong> {action.areaOfEffect.size} ft{" "}
                      {toTitleCase(action.areaOfEffect.shape)}
                    </div>
                  )}
                  {action.savingThrow && (
                    <div className="meta-item">
                      <strong>Save:</strong>{" "}
                      {toTitleCase(action.savingThrow.ability)}
                    </div>
                  )}
                  {action.attackRoll && (
                    <div className="meta-item">
                      <strong>Attack Roll:</strong>{" "}
                      {toTitleCase(action.attackRoll.ability)}
                    </div>
                  )}
                  {damageSummary && (
                    <div className="meta-item highlight">
                      <strong>Damage:</strong> {damageSummary}
                    </div>
                  )}
                </div>

                <hr className="divider" />

                <div className="trait-action-description">
                  {action.description?.trim() || "No description available."}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
