import type React from "react";
import { useMemo, useState } from "react";
import {
  useCombatActions,
  type CombatRollMetadata,
  type CombatActionSection,
} from "../hooks/useCombatActions";
import { useCharacterStore } from "../store/useCharacterStore";
import { DiceRoller } from "./DiceRoller/DiceRoller";
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

interface ActiveRoller {
  entryId: string;
  kind: "attack" | "damage";
  damageId?: string;
}

interface EntryRollResult {
  attack?: string;
  damage: Record<string, string>;
}

type AttackRollMode = "normal" | "advantage" | "disadvantage";

const ATTACK_ROLL_MODES: AttackRollMode[] = [
  "normal",
  "advantage",
  "disadvantage",
];

const ATTACK_ROLL_MODE_LABELS: Record<AttackRollMode, string> = {
  normal: "Normal",
  advantage: "Advantage",
  disadvantage: "Disadvantage",
}

const formatModifier = (modifier: number): string => {
  if (modifier === 0) return "";
  return modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
};

export const ActionsBoard: React.FC = () => {
  const { spellcasting, sections, toRomanNumeral } = useCombatActions();
  const { expendTraitActionUse, restoreTraitActionUse } = useCharacterStore();
  const [activeRoller, setActiveRoller] = useState<ActiveRoller | null>(null);
  const [attackRollModes, setAttackRollModes] = useState<Record<string, AttackRollMode>>({});
  const [rollResultsByEntry, setRollResultsByEntry] = useState<
    Record<string, EntryRollResult>
  >({});

  const getAttackRollMode = (entryId: string): AttackRollMode =>
    attackRollModes[entryId] ?? "normal";

  const setAttackResult = (
    entryId: string,
    config: CombatRollMetadata,
    rolls: number[],
    mode: AttackRollMode,
  ) => {
    const first = rolls[0] ?? 0;
    const second = rolls[1] ?? 0;
    const keptValue = mode === "normal"
      ? first
      : mode === "advantage"
        ? Math.max(first, second)
        : Math.min(first, second);

    const total = keptValue + config.modifier;
    const critLabel = keptValue === 20
      ? " (critical success)"
      : keptValue === 1
        ? " (critical fail)"
        : "";

    const rollPart = mode === "normal"
      ? `d20 ${keptValue}`
      : `d20 ${first}/${second} -> keep ${keptValue} (${mode})`;

    const detail = `${total} (${rollPart}${formatModifier(config.modifier)})${critLabel}`;

    setRollResultsByEntry((previous) => {
      const existing = previous[entryId] ?? { damage: {} };
      return {
        ...previous,
        [entryId]: {
          ...existing,
          attack: detail,
          damage: existing.damage,
        },
      };
    });
  };

  const setDamageResult = (
    entryId: string,
    damageId: string,
    config: CombatRollMetadata,
    rollTotal: number,
  ) => {
    const total = rollTotal + config.modifier;
    const detail = `${total} (${rollTotal}${formatModifier(config.modifier)})`;

    setRollResultsByEntry((previous) => {
      const existing = previous[entryId] ?? { damage: {} };
      return {
        ...previous,
        [entryId]: {
          ...existing,
          damage: {
            ...existing.damage,
            [damageId]: detail,
          },
        },
      };
    });
  };

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

                      {!!entry.attackRoll && (
                        <div className="combat-roll-row">
                          <div
                            className="attack-roll-mode-group"
                            role="radiogroup"
                            aria-label={`${entry.name} to-hit mode`}
                          >
                            {ATTACK_ROLL_MODES.map((mode) => {
                              const checked = getAttackRollMode(entry.id) === mode;
                              return (
                                <label
                                  key={`${entry.id}-${mode}`}
                                  className={`attack-roll-mode-option ${checked ? "selected" : ""}`}
                                >
                                  <input
                                    type="radio"
                                    name={`roll-mode-${entry.id}`}
                                    checked={checked}
                                    onChange={() => {
                                      setAttackRollModes((previous) => ({
                                        ...previous,
                                        [entry.id]: mode,
                                      }));
                                    }}
                                  />
                                  {ATTACK_ROLL_MODE_LABELS[mode]}
                                </label>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            className="mini-use-btn"
                            onClick={() => {
                              setActiveRoller((current) =>
                                current?.entryId === entry.id && current.kind === "attack"
                                  ? null
                                  : { entryId: entry.id, kind: "attack" },
                              );
                            }}
                            disabled={entry.isExhausted}
                          >
                            Roll To-Hit
                          </button>

                          {rollResultsByEntry[entry.id]?.attack && (
                            <span className="combat-roll-result">
                              To-Hit: {rollResultsByEntry[entry.id]?.attack}
                            </span>
                          )}
                        </div>
                      )}

                      {(entry.damageRolls ?? []).map((damageRoll) => (
                        <div key={damageRoll.id} className="combat-roll-row">
                          <button
                            type="button"
                            className="mini-use-btn secondary"
                            onClick={() => {
                              setActiveRoller((current) =>
                                current?.entryId === entry.id
                                && current.kind === "damage"
                                && current.damageId === damageRoll.id
                                  ? null
                                  : {
                                      entryId: entry.id,
                                      kind: "damage",
                                      damageId: damageRoll.id,
                                    },
                              );
                            }}
                            disabled={entry.isExhausted}
                          >
                            {damageRoll.label}
                          </button>

                          {rollResultsByEntry[entry.id]?.damage[damageRoll.id] && (
                            <span className="combat-roll-result">
                              {damageRoll.label}: {rollResultsByEntry[entry.id]?.damage[damageRoll.id]}
                            </span>
                          )}
                        </div>
                      ))}

                      {(entry.damageRolls?.length ?? 0) > 1 && (
                        <div className="combat-roll-row">
                          <button
                            type="button"
                            className="mini-use-btn secondary"
                            onClick={() => {
                              setActiveRoller((current) =>
                                current?.entryId === entry.id
                                && current.kind === "damage"
                                && current.damageId === "__all__"
                                  ? null
                                  : {
                                      entryId: entry.id,
                                      kind: "damage",
                                      damageId: "__all__",
                                    },
                              );
                            }}
                            disabled={entry.isExhausted}
                          >
                            Roll All Damage
                          </button>
                        </div>
                      )}

                      {activeRoller?.entryId === entry.id && entry.attackRoll && activeRoller.kind === "attack" && (
                        <div className="combat-roll-roller-wrap">
                          {(() => {
                            const mode = getAttackRollMode(entry.id);
                            return (
                          <DiceRoller
                            count={mode === "normal" ? 1 : 2}
                            sides={entry.attackRoll.sides}
                            size="small"
                            hideTotal
                            rollLabel={`Roll ${entry.attackRoll.label}`}
                            onRollComplete={(rolls) => {
                              setAttackResult(
                                entry.id,
                                entry.attackRoll!,
                                rolls,
                                mode,
                              );
                              setActiveRoller(null);
                            }}
                            disabled={entry.isExhausted}
                          />
                            );
                          })()}
                        </div>
                      )}

                      {activeRoller?.entryId === entry.id
                        && activeRoller.kind === "damage"
                        && typeof activeRoller.damageId === "string"
                        && activeRoller.damageId !== "__all__"
                        && entry.damageRolls?.some((damageRoll) => damageRoll.id === activeRoller.damageId)
                        && (
                          <div className="combat-roll-roller-wrap">
                            <DiceRoller
                              count={entry.damageRolls.find((damageRoll) => damageRoll.id === activeRoller.damageId)?.count ?? 1}
                              sides={entry.damageRolls.find((damageRoll) => damageRoll.id === activeRoller.damageId)?.sides ?? 6}
                              size="small"
                              hideTotal
                              rollLabel={`Roll ${entry.damageRolls.find((damageRoll) => damageRoll.id === activeRoller.damageId)?.label ?? "Damage"}`}
                              onRollComplete={(_, summary) => {
                                const metadata = entry.damageRolls?.find(
                                  (damageRoll) => damageRoll.id === activeRoller.damageId,
                                );
                                if (!metadata) return;
                                setDamageResult(
                                  entry.id,
                                  metadata.id,
                                  metadata,
                                  summary.total,
                                );
                                setActiveRoller(null);
                              }}
                              disabled={entry.isExhausted}
                            />
                          </div>
                        )}

                      {activeRoller?.entryId === entry.id
                        && activeRoller.kind === "damage"
                        && activeRoller.damageId === "__all__"
                        && (entry.damageRolls?.length ?? 0) > 0
                        && (
                          <div className="combat-roll-roller-wrap multi-damage-roller-wrap">
                            {entry.damageRolls?.map((damageRoll) => (
                              <div key={`${entry.id}-all-${damageRoll.id}`} className="combat-roll-row">
                                <DiceRoller
                                  count={damageRoll.count}
                                  sides={damageRoll.sides}
                                  size="small"
                                  hideTotal
                                  rollLabel={`Roll ${damageRoll.label}`}
                                  onRollComplete={(_, summary) => {
                                    setDamageResult(
                                      entry.id,
                                      damageRoll.id,
                                      damageRoll,
                                      summary.total,
                                    );
                                  }}
                                  disabled={entry.isExhausted}
                                />
                              </div>
                            ))}
                            <div className="combat-roll-row">
                              <button
                                type="button"
                                className="mini-use-btn"
                                onClick={() => setActiveRoller(null)}
                              >
                                Done
                              </button>
                            </div>
                          </div>
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
