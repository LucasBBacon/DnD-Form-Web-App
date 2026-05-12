import type React from "react";
import "./ActionsBoard.css";
import { DiceRoller } from "../DiceRoller/DiceRoller";
import { CostPips } from "./ui/CostPips";
import { SpellSlotHud } from "./ui/SpellSlotHud";
import { AttackRollModeToggle } from "./ui/AttackRollModeToggle";
import type { CombatActionSection, CombatActionEntry, CombatRollMetadata } from "../../hooks/useCombatActions";

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

const formatModifier = (modifier: number): string => {
  if (modifier === 0) return "";
  return modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
};

/**
 * Props for ActionsBoardView presentational component.
 * All data is passed as props; no hooks are used.
 */
export interface ActionsBoardViewProps {
  // Spell slots data
  slotHudRows: Array<{ label: string; text: string }>;

  // Combat action sections
  sections: Partial<Record<CombatActionSection, CombatActionEntry[]>>;

  // Local state
  activeRoller: { entryId: string; kind: "attack" | "damage"; damageId?: string } | null;
  attackRollModes: Record<string, "normal" | "advantage" | "disadvantage">;
  rollResultsByEntry: Record<string, { attack?: string; damage: Record<string, string> }>;

  // Callbacks
  onActiveRollerChange: (roller: { entryId: string; kind: "attack" | "damage"; damageId?: string } | null) => void;
  onAttackRollModeChange: (entryId: string, mode: "normal" | "advantage" | "disadvantage") => void;
  onAttackResult: (entryId: string, config: CombatRollMetadata, rolls: number[], mode: "normal" | "advantage" | "disadvantage") => void;
  onDamageResult: (entryId: string, damageId: string, config: CombatRollMetadata, rollTotal: number) => void;
  onExpendTraitUse: (traitId: string) => void;
  onRestoreTraitUse: (traitId: string) => void;

  // Utilities
  toRomanNumeral: (level: number) => string;
}

/**
 * Presentational component for the ActionsBoard.
 * Renders combat actions, spell slots, and roll controls given all data as props.
 * No hooks or external dependencies.
 */
export const ActionsBoardView: React.FC<ActionsBoardViewProps> = ({
  slotHudRows,
  sections,
  activeRoller,
  attackRollModes,
  rollResultsByEntry,
  onActiveRollerChange,
  onAttackRollModeChange,
  onAttackResult,
  onDamageResult,
  onExpendTraitUse,
  onRestoreTraitUse,
  toRomanNumeral,
}) => {
  const getAttackRollMode = (entryId: string) =>
    attackRollModes[entryId] ?? "normal";

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

      <SpellSlotHud rows={slotHudRows} />

      <div className="combat-sections">
        {SECTION_ORDER.map((section) => {
          const entries = sections[section] || [];

          return (
            <div key={section} className="combat-section">
              <h3 className="combat-section-header">
                {SECTION_LABELS[section]}
              </h3>

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
                              <CostPips
                                remaining={entry.uses.remaining}
                                total={entry.uses.total}
                              />
                            </span>
                          )}

                          {entry.source === "attack" && (
                            <span className="cost-badge at-will">AT-WILL</span>
                          )}
                        </div>
                      </header>

                      <div className="combat-action-stats">
                        {entry.quickStats.map((stat, index) => (
                          <span
                            key={`${entry.id}-stat-${index}`}
                            className="quick-stat"
                          >
                            {stat}
                          </span>
                        ))}
                      </div>

                      {entry.description && (
                        <p className="combat-action-description">
                          {entry.description}
                        </p>
                      )}

                      {!!entry.attackRoll && (
                        <div className="combat-roll-row">
                          <AttackRollModeToggle
                            entryId={entry.id}
                            mode={getAttackRollMode(entry.id)}
                            label={`${entry.name} to-hit mode`}
                            onChange={(mode) =>
                              onAttackRollModeChange(entry.id, mode)
                            }
                          />

                          <button
                            type="button"
                            className="mini-use-btn"
                            onClick={() => {
                              onActiveRollerChange(
                                activeRoller?.entryId === entry.id &&
                                activeRoller.kind === "attack"
                                  ? null
                                  : { entryId: entry.id, kind: "attack" }
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
                              onActiveRollerChange(
                                activeRoller?.entryId === entry.id &&
                                activeRoller.kind === "damage" &&
                                activeRoller.damageId === damageRoll.id
                                  ? null
                                  : {
                                      entryId: entry.id,
                                      kind: "damage",
                                      damageId: damageRoll.id,
                                    }
                              );
                            }}
                            disabled={entry.isExhausted}
                          >
                            {damageRoll.label}
                          </button>

                          {rollResultsByEntry[entry.id]?.damage[
                            damageRoll.id
                          ] && (
                            <span className="combat-roll-result">
                              {damageRoll.label}:{" "}
                              {
                                rollResultsByEntry[entry.id]?.damage[
                                  damageRoll.id
                                ]
                              }
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
                              onActiveRollerChange(
                                activeRoller?.entryId === entry.id &&
                                activeRoller.kind === "damage" &&
                                activeRoller.damageId === "__all__"
                                  ? null
                                  : {
                                      entryId: entry.id,
                                      kind: "damage",
                                      damageId: "__all__",
                                    }
                              );
                            }}
                            disabled={entry.isExhausted}
                          >
                            Roll All Damage
                          </button>
                        </div>
                      )}

                      {activeRoller?.entryId === entry.id &&
                        entry.attackRoll &&
                        activeRoller.kind === "attack" && (
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
                                    onAttackResult(
                                      entry.id,
                                      entry.attackRoll!,
                                      rolls,
                                      mode
                                    );
                                    onActiveRollerChange(null);
                                  }}
                                  disabled={entry.isExhausted}
                                />
                              );
                            })()}
                          </div>
                        )}

                      {activeRoller?.entryId === entry.id &&
                        activeRoller.kind === "damage" &&
                        typeof activeRoller.damageId === "string" &&
                        activeRoller.damageId !== "__all__" &&
                        entry.damageRolls?.some(
                          (damageRoll) =>
                            damageRoll.id === activeRoller.damageId
                        ) && (
                          <div className="combat-roll-roller-wrap">
                            <DiceRoller
                              count={
                                entry.damageRolls.find(
                                  (damageRoll) =>
                                    damageRoll.id === activeRoller.damageId
                                )?.count ?? 1
                              }
                              sides={
                                entry.damageRolls.find(
                                  (damageRoll) =>
                                    damageRoll.id === activeRoller.damageId
                                )?.sides ?? 6
                              }
                              size="small"
                              hideTotal
                              rollLabel={`Roll ${entry.damageRolls.find((damageRoll) => damageRoll.id === activeRoller.damageId)?.label ?? "Damage"}`}
                              onRollComplete={(_, summary) => {
                                const metadata = entry.damageRolls?.find(
                                  (damageRoll) =>
                                    damageRoll.id === activeRoller.damageId
                                );
                                if (!metadata) return;
                                onDamageResult(
                                  entry.id,
                                  metadata.id,
                                  metadata,
                                  summary.total
                                );
                                onActiveRollerChange(null);
                              }}
                              disabled={entry.isExhausted}
                            />
                          </div>
                        )}

                      {activeRoller?.entryId === entry.id &&
                        activeRoller.kind === "damage" &&
                        activeRoller.damageId === "__all__" &&
                        (entry.damageRolls?.length ?? 0) > 0 && (
                          <div className="combat-roll-roller-wrap multi-damage-roller-wrap">
                            {entry.damageRolls?.map((damageRoll) => (
                              <div
                                key={`${entry.id}-all-${damageRoll.id}`}
                                className="combat-roll-row"
                              >
                                <DiceRoller
                                  count={damageRoll.count}
                                  sides={damageRoll.sides}
                                  size="small"
                                  hideTotal
                                  rollLabel={`Roll ${damageRoll.label}`}
                                  onRollComplete={(_, summary) => {
                                    onDamageResult(
                                      entry.id,
                                      damageRoll.id,
                                      damageRoll,
                                      summary.total
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
                                onClick={() => onActiveRollerChange(null)}
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
                            onClick={() =>
                              onExpendTraitUse(
                                entry.id.replace("trait:", "")
                              )
                            }
                            disabled={entry.uses.remaining <= 0}
                          >
                            Use
                          </button>
                          <button
                            type="button"
                            className="mini-use-btn secondary"
                            onClick={() =>
                              onRestoreTraitUse(
                                entry.id.replace("trait:", "")
                              )
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
