import type React from "react";
import { useMemo } from "react";
import {
  useCombatActions,
  type CombatActionSection,
} from "../hooks/useCombatActions";
import { useCharacterStore } from "../store/useCharacterStore";
import "./ActionsBoard.css";

const SECTION_ORDER: CombatActionSection[] = [
  "action",
  "bonus_action",
  "reaction",
];

const SECTION_LABELS: Record<CombatActionSection, string> = {
  action: "Actions",
  bonus_action: "Bonus Actions",
  reaction: "Reactions",
};

const renderPips = (remaining: number, total: number) => {
  const normalizedTotal = Math.max(total, 1);
  return Array.from({ length: normalizedTotal }).map((_, index) => (
    <span
      key={`pip-${index}`}
      className={`cost-pip ${index < remaining ? "filled" : "empty"}`}
      aria-hidden="true"
    />
  ));
};

export const ActionsBoard: React.FC = () => {
  const { spellcasting, sections, toRomanNumeral } = useCombatActions();
  const { expendTraitActionUse, restoreTraitActionUse } = useCharacterStore();

  const slotHud = useMemo(() => {
    const rows: Array<{ label: string; text: string }> = [];

    Object.entries(spellcasting.slots.shared).forEach(([level, slotData]) => {
      if (slotData.total <= 0) return;
      const remaining = Math.max(slotData.total - slotData.expended, 0);
      const bubbles = "o".repeat(remaining).padEnd(slotData.total, " ");
      rows.push({
        label: `Lvl ${level}`,
        text: `[${bubbles}]`,
      });
    });

    if (spellcasting.slots.pact && spellcasting.slots.pact.total > 0) {
      const remaining = Math.max(
        spellcasting.slots.pact.total - spellcasting.slots.pact.expended,
        0,
      );
      const bubbles = "o"
        .repeat(remaining)
        .padEnd(spellcasting.slots.pact.total, " ");
      rows.push({
        label: `Pact ${spellcasting.slots.pact.level}`,
        text: `[${bubbles}]`,
      });
    }

    return rows;
  }, [spellcasting.slots.pact, spellcasting.slots.shared]);

  return (
    <section className="actions-board-container card">
      <div className="combat-header-row">
        <div>
          <h2 className="combat-title">Combat Actions</h2>
          <p className="combat-subtitle">
            Unified action economy view. Spell preparation and long-form reading
            live in Spellbook management.
          </p>
        </div>
      </div>

      <div className="spell-slot-hud" aria-label="Available spell slots">
        <span className="hud-label">Spell Slots</span>
        <div className="hud-track-list">
          {slotHud.length === 0 ? (
            <span className="hud-empty">No spell slots</span>
          ) : (
            slotHud.map((entry) => (
              <span key={entry.label} className="hud-track">
                <strong>{entry.label}:</strong> {entry.text}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="combat-sections">
        {SECTION_ORDER.map((section) => {
          const entries = sections[section];

          return (
            <div key={section} className="combat-section">
              <h3 className="combat-section-header">{SECTION_LABELS[section]}</h3>

              {entries.length === 0 ? (
                <div className="empty-state">
                  No {SECTION_LABELS[section].toLowerCase()} available.
                </div>
              ) : (
                <div className="combat-card-list">
                  {entries.map((entry) => (
                    <article
                      key={entry.id}
                      className={`combat-action-card ${entry.isExhausted ? "is-exhausted" : ""}`}
                    >
                      <header className="combat-action-header">
                        <div className="combat-action-title-wrap">
                          <h4 className="combat-action-title">{entry.name}</h4>
                          <span className="combat-action-source">
                            {entry.subtitle || entry.source}
                          </span>
                        </div>

                        <div className="combat-action-cost-wrap">
                          {entry.source === "spell" &&
                            typeof entry.spellLevel === "number" && (
                              <span
                                className={`cost-badge spell-level lvl-${Math.min(
                                  Math.max(entry.spellLevel, 0),
                                  9,
                                )}`}
                                title={
                                  entry.spellLevel === 0
                                    ? "Cantrip"
                                    : `Spell Slot Level ${entry.spellLevel}`
                                }
                              >
                                {toRomanNumeral(entry.spellLevel)}
                              </span>
                            )}

                          {entry.uses && (
                            <span
                              className="cost-badge uses"
                              title={`${entry.uses.remaining} of ${entry.uses.total} uses remaining`}
                            >
                              {renderPips(entry.uses.remaining, entry.uses.total)}
                            </span>
                          )}

                          {entry.source === "attack" && (
                            <span className="cost-badge at-will">AT-WILL</span>
                          )}
                        </div>
                      </header>

                      <div className="combat-action-stats">
                        {entry.quickStats.map((stat, index) => (
                          <span key={`${entry.id}-stat-${index}`} className="quick-stat">
                            {stat}
                          </span>
                        ))}
                      </div>

                      {entry.description && (
                        <p className="combat-action-description">{entry.description}</p>
                      )}

                      {entry.uses && (
                        <div className="trait-use-controls">
                          <button
                            type="button"
                            className="mini-use-btn"
                            onClick={() => expendTraitActionUse(entry.id.replace("trait:", ""))}
                            disabled={entry.uses.remaining <= 0}
                          >
                            Use
                          </button>
                          <button
                            type="button"
                            className="mini-use-btn secondary"
                            onClick={() =>
                              restoreTraitActionUse(entry.id.replace("trait:", ""))
                            }
                            disabled={entry.uses.remaining >= entry.uses.total}
                          >
                            Restore
                          </button>
                        </div>
                      )}

                      {entry.isExhausted && (
                        <p className="exhausted-note">Resource exhausted.</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
