import type React from "react";
import "./ActionsBoard.css";
import { DiceRoller } from "../DiceRoller/DiceRoller";
import { CostPips } from "./ui/CostPips";
import { SpellSlotHud } from "./ui/SpellSlotHud";
import { AttackRollModeToggle } from "./ui/AttackRollModeToggle";
import { WeaponPropertyBadges } from "./ui/WeaponPropertyBadges";
import { AmmoIndicator } from "./ui/AmmoIndicator";
import {
  RangeDistancePicker,
  type AttackRangeSelection,
} from "./ui/RangeDistancePicker";
import {
  VersatileModeToggle,
  type VersatileMode,
} from "./ui/VersatileModeToggle";
import type {
  CombatActionSection,
  CombatActionEntry,
  CombatRollMetadata,
} from "../../hooks/useCombatActions";

// #region Constants and Utility Functions

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatModifier = (modifier: number): string => {
  if (modifier === 0) return "";
  return modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
};

// #endregion

// #region Types and Interfaces

/**
 * Props for the ActionsBoardView presentational component.
 * Combines all data and callbacks needed to render the actions board UI.
 * This is separate from the main ActionsBoard component to allow for easier testing and story rendering without hooks.
 */
export interface ActionsBoardViewProps {
  /** Rows for the spell slot HUD */
  slotHudRows: Array<{
    /** Label for the spell slot row */
    label: string;
    /** Text representation of the spell slots */
    text: string;
  }>;

  /** Combat action sections */
  sections: Partial<Record<CombatActionSection, CombatActionEntry[]>>;

  /** Currently active roller, if any */
  activeRoller: {
    /** ID of the entry being rolled */
    entryId: string;
    /** Type of roll */
    kind: "attack" | "damage";
    /** Optional ID for damage roll */
    damageId?: string;
  } | null;
  /** Attack roll modes for each entry */
  attackRollModes: Record<string, "normal" | "advantage" | "disadvantage">;
  /** Range selection (normal/long) for each ranged attack entry */
  attackRangeSelections?: Record<string, AttackRangeSelection>;
  /** Versatile mode selection (one-handed/two-handed) for each versatile attack entry */
  versatileModeSelections?: Record<string, VersatileMode>;
  /** Roll results for each entry */
  rollResultsByEntry: Record<
    string,
    {
      attack?: string;
      /** Damage results for each damage roll */
      damage: Record<string, string>;
    }
  >;

  /** Callback when the active roller changes */
  onActiveRollerChange: (
    roller: {
      entryId: string;
      kind: "attack" | "damage";
      damageId?: string;
    } | null,
  ) => void;
  /** Callback when the attack roll mode changes */
  onAttackRollModeChange: (
    entryId: string,
    mode: "normal" | "advantage" | "disadvantage",
  ) => void;
  /** Callback when an attack range selection changes */
  onAttackRangeChange?: (
    entryId: string,
    selection: AttackRangeSelection,
  ) => void;
  /** Callback when a versatile mode selection changes */
  onVersatileModeChange?: (entryId: string, mode: VersatileMode) => void;
  /** Callback when an attack result is available */
  onAttackResult: (
    entryId: string,
    config: CombatRollMetadata,
    rolls: number[],
    mode: "normal" | "advantage" | "disadvantage",
  ) => void;
  /** Callback when a damage result is available */
  onDamageResult: (
    entryId: string,
    damageId: string,
    config: CombatRollMetadata,
    rollTotal: number,
  ) => void;
  /** Callback when ammunition is consumed (fired or expended) */
  onAmmoConsume?: (ammoItemId: string, quantity: number) => void;
  /** Callback when a trait use is expended */
  onExpendTraitUse: (traitId: string) => void;
  /** Callback when a trait use is restored */
  onRestoreTraitUse: (traitId: string) => void;
  /** Entry id currently choosing a spell slot pool */
  spellChoiceEntryId?: string | null;
  /** User-facing cast feedback keyed by action entry id */
  spellActionFeedbackByEntry?: Record<string, string>;
  /** Callback when a spell cast is requested */
  onCastSpell?: (entryId: string) => void;
  /** Callback when the user chooses the spell slot pool */
  onChooseSpellSlotPool?: (entryId: string, pool: "shared" | "pact") => void;
  /** Callback when slot pool choice is cancelled */
  onCancelSpellSlotChoice?: (entryId: string) => void;

  /** Utility to convert a number to a Roman numeral */
  toRomanNumeral: (level: number) => string;
}

// #endregion

// #region View Component

/**
 * Presentational component for the Actions Board.
 * Receives all data and callbacks as props from the main ActionsBoard component.
 * Responsible for rendering the UI based on the provided props.
 * @param param0 Props for the ActionsBoardView component, including combat action sections, active roller state, roll results, and callbacks for user interactions.
 * @returns The rendered ActionsBoardView component.
 */
export const ActionsBoardView: React.FC<ActionsBoardViewProps> = ({
  slotHudRows,
  sections,
  activeRoller,
  attackRollModes,
  attackRangeSelections = {},
  versatileModeSelections = {},
  rollResultsByEntry,
  onActiveRollerChange,
  onAttackRollModeChange,
  onAttackRangeChange = () => {},
  onVersatileModeChange = () => {},
  onAttackResult,
  onDamageResult,
  onAmmoConsume = () => {},
  onExpendTraitUse,
  onRestoreTraitUse,
  spellChoiceEntryId = null,
  spellActionFeedbackByEntry = {},
  onCastSpell = () => {},
  onChooseSpellSlotPool = () => {},
  onCancelSpellSlotChoice = () => {},
  toRomanNumeral,
}) => {
  const getAttackRollMode = (entryId: string, heavyDisadvantage?: boolean) => {
    if (heavyDisadvantage) return "disadvantage" as const;
    return attackRollModes[entryId] ?? ("normal" as const);
  };

  const getAttackRangeSelection = (entry: CombatActionEntry) => {
    const selected = attackRangeSelections[entry.id] ?? "normal";
    if (selected === "long" && typeof entry.rangeInfo?.long !== "number") {
      return "normal" as const;
    }
    return selected;
  };

  const getVersatileModeSelection = (entryId: string) => {
    return versatileModeSelections[entryId] ?? ("one-handed" as const);
  };

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

                      {entry.source === "attack" &&
                        (entry.weaponProperties ?? []).length > 0 && (
                          <WeaponPropertyBadges
                            properties={entry.weaponProperties!}
                          />
                        )}

                      {entry.source === "attack" && entry.ammo != null && (
                        <AmmoIndicator ammo={entry.ammo} />
                      )}

                      {entry.source === "attack" && entry.hasReachProperty && (
                        <p className="reach-modifier-note">
                          <span className="reach-modifier-badge">
                            Reach: {entry.meleeReachFeet ?? 10} ft
                          </span>
                        </p>
                      )}

                      {entry.source === "attack" && entry.rangeInfo && (
                        <RangeDistancePicker
                          entryId={entry.id}
                          rangeInfo={entry.rangeInfo}
                          value={getAttackRangeSelection(entry)}
                          onChange={(selection) =>
                            onAttackRangeChange(entry.id, selection)
                          }
                        />
                      )}

                      {entry.source === "attack" &&
                        entry.versatileDamageDice &&
                        entry.baseDamageDice && (
                          <VersatileModeToggle
                            entryId={entry.id}
                            baseDamageDice={entry.baseDamageDice}
                            versatileDamageDice={entry.versatileDamageDice}
                            value={getVersatileModeSelection(entry.id)}
                            onChange={(mode) =>
                              onVersatileModeChange(entry.id, mode)
                            }
                          />
                        )}

                      {entry.description && (
                        <p className="combat-action-description">
                          {entry.description}
                        </p>
                      )}

                      {entry.source === "spell" && (
                        <div className="spell-cast-controls">
                          <button
                            type="button"
                            className="mini-use-btn"
                            onClick={() => onCastSpell(entry.id)}
                            disabled={
                              entry.spellCast != null && !entry.spellCast.canCast
                            }
                            title={
                              entry.spellCast != null && !entry.spellCast.canCast
                                ? entry.spellCast?.unavailableReason ||
                                  "No compatible spell slot available."
                                : entry.spellLevel === 0
                                  ? "Cast cantrip"
                                  : "Cast spell"
                            }
                          >
                            Cast
                          </button>

                          {spellChoiceEntryId === entry.id &&
                            entry.spellCast?.canUseSharedSlot &&
                            entry.spellCast?.canUsePactSlot && (
                              <div className="spell-slot-choice-wrap">
                                <span className="spell-slot-choice-label">
                                  Choose slot:
                                </span>
                                <button
                                  type="button"
                                  className="mini-use-btn secondary"
                                  onClick={() =>
                                    onChooseSpellSlotPool(entry.id, "shared")
                                  }
                                >
                                  Shared
                                </button>
                                <button
                                  type="button"
                                  className="mini-use-btn secondary"
                                  onClick={() =>
                                    onChooseSpellSlotPool(entry.id, "pact")
                                  }
                                >
                                  Pact
                                </button>
                                <button
                                  type="button"
                                  className="mini-use-btn secondary"
                                  onClick={() =>
                                    onCancelSpellSlotChoice(entry.id)
                                  }
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                        </div>
                      )}

                      {!!entry.attackRoll && (
                        <div className="combat-roll-row">
                          {entry.heavyDisadvantage && (
                            <span
                              className="heavy-disadvantage-badge"
                              title="Heavy weapons cannot be used effectively by Small creatures. Attack rolls are locked to Disadvantage."
                            >
                              ⚠ Heavy (Small)
                            </span>
                          )}
                          <AttackRollModeToggle
                            entryId={entry.id}
                            mode={getAttackRollMode(entry.id, entry.heavyDisadvantage)}
                            label={`${entry.name} to-hit mode`}
                            disabled={entry.heavyDisadvantage}
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
                              onActiveRollerChange(
                                activeRoller?.entryId === entry.id &&
                                  activeRoller.kind === "damage" &&
                                  activeRoller.damageId === damageRoll.id
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
                                    },
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
                              const mode = getAttackRollMode(entry.id, entry.heavyDisadvantage);
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
                                      mode,
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
                            damageRoll.id === activeRoller.damageId,
                        ) && (
                          <div className="combat-roll-roller-wrap">
                            <DiceRoller
                              count={
                                entry.damageRolls.find(
                                  (damageRoll) =>
                                    damageRoll.id === activeRoller.damageId,
                                )?.count ?? 1
                              }
                              sides={
                                entry.damageRolls.find(
                                  (damageRoll) =>
                                    damageRoll.id === activeRoller.damageId,
                                )?.sides ?? 6
                              }
                              size="small"
                              hideTotal
                              rollLabel={`Roll ${entry.damageRolls.find((damageRoll) => damageRoll.id === activeRoller.damageId)?.label ?? "Damage"}`}
                              onRollComplete={(_, summary) => {
                                const metadata = entry.damageRolls?.find(
                                  (damageRoll) =>
                                    damageRoll.id === activeRoller.damageId,
                                );
                                if (!metadata) return;
                                onDamageResult(
                                  entry.id,
                                  metadata.id,
                                  metadata,
                                  summary.total,
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
                              onExpendTraitUse(entry.id.replace("trait:", ""))
                            }
                            disabled={entry.uses.remaining <= 0}
                          >
                            Use
                          </button>
                          <button
                            type="button"
                            className="mini-use-btn secondary"
                            onClick={() =>
                              onRestoreTraitUse(entry.id.replace("trait:", ""))
                            }
                            disabled={entry.uses.remaining >= entry.uses.total}
                          >
                            Restore
                          </button>
                        </div>
                      )}

                      {entry.source === "spell" &&
                        entry.spellCast != null &&
                        !entry.spellCast.canCast &&
                        entry.spellCast?.unavailableReason && (
                          <p className="exhausted-note">
                            {entry.spellCast.unavailableReason}
                          </p>
                        )}

                      {entry.source === "spell" &&
                        spellActionFeedbackByEntry[entry.id] && (
                          <p className="exhausted-note">
                            {spellActionFeedbackByEntry[entry.id]}
                          </p>
                        )}

                      {entry.source !== "spell" && entry.isExhausted && (
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

// #endregion
