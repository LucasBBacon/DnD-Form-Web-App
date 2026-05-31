/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import "./CombatActionRow.css";
import { DiceRoller } from "../../ui/DiceRoller/DiceRoller";
import type { DieType } from "../../ui/DiceRoller/PolyDie";
import type {
  AttackActionEntry,
  CombatActionEntry,
  CombatRollMetadata,
  SpellSaveActionEntry,
  TraitUseActionEntry,
} from "../../../hooks/useCombatActions";
import { useState } from "react";

export interface CombatActionRowProps {
  entry: CombatActionEntry;
  attackRollMode: "normal" | "advantage" | "disadvantage";
  onAttackRollModeChange: (
    entryId: string,
    mode: "normal" | "advantage" | "disadvantage",
  ) => void;
  onAttackResult: (
    entryId: string,
    config: CombatRollMetadata,
    rolls: number[],
    mode: string,
  ) => void;
  onDamageResult: (
    entryId: string,
    damageId: string,
    config: CombatRollMetadata,
    total: number,
  ) => void;
  onCastSpell?: (entryId: string) => void;
  onExpendTraitUse?: (entryId: string) => void;
  toRomanNumeral: (level: number) => string;
}

export const CombatActionRow: React.FC<CombatActionRowProps> = ({
  entry,
  attackRollMode,
  onAttackRollModeChange,
  onAttackResult,
  onDamageResult,
  onCastSpell,
  onExpendTraitUse,
  toRomanNumeral,
}) => {
  const [isPreparingCast, setIsPreparingCast] = useState(false);
  const [selectedCastLevel, setSelectedCastLevel] = useState<number | null>(
    null,
  );
  const [selectedPool, setSelectedPool] = useState<"shared" | "pact">("shared");

  const renderAttackControls = (attackEntry: AttackActionEntry) => (
    <div className="action-controls-group attack-group">
      {attackEntry.attackRoll && (
        <div className="roll-mode-toggle">
          {(["disadvantage", "normal", "advantage"] as const).map((mode) => (
            <button
              key={mode}
              className={`mode-btn ${attackRollMode === mode ? "active" : ""}`}
              onClick={() => onAttackRollModeChange(entry.id, mode)}
              title={mode.charAt(0).toUpperCase() + mode.slice(1)}
            >
              {mode === "normal"
                ? "Norm"
                : mode === "advantage"
                  ? "Adv"
                  : "Dis"}
            </button>
          ))}
        </div>
      )}

      {/* To-hit Roller */}
      {attackEntry.attackRoll && (
        <DiceRoller
          sides={attackEntry.attackRoll.sides as DieType}
          count={
            attackRollMode === "normal"
              ? attackEntry.attackRoll.count
              : Math.max(2, attackEntry.attackRoll.count)
          }
          rollLabel={attackEntry.attackRoll.label}
          onRollComplete={(rolls) =>
            onAttackResult(
              attackEntry.id,
              attackEntry.attackRoll!,
              rolls,
              attackRollMode,
            )
          }
          className="attack-roller"
        />
      )}

      {/* Damage Rollers */}
      {attackEntry.damageRolls && attackEntry.damageRolls.length > 0 && (
        <div className="damage-rollers-container">
          {attackEntry.damageRolls.map((dmg) => (
            <DiceRoller
              key={dmg.id}
              sides={dmg.sides as DieType}
              count={
                attackRollMode === "normal" ? dmg.count : Math.max(2, dmg.count)
              }
              rollLabel={dmg.label}
              onRollComplete={(_, summary) =>
                onDamageResult(entry.id, dmg.id, dmg, summary.total)
              }
              className="damage-roller"
            />
          ))}
        </div>
      )}
    </div>
  );
  const renderSpellControls = (spellEntry: SpellSaveActionEntry) => {
    const meta = spellEntry.spellMetadata;
    const isCastable = meta?.canCast;

    if (!meta) {
      return (
        <button
          className="action-btn cast-btn"
          onClick={() => onCastSpell?.(spellEntry.id)}
          disabled={!isCastable}
        >
          Cast
        </button>
      );
    }

    const handleInitiateCast = () => {
      setSelectedCastLevel(meta.baseSpellLevel);

      // auto-select pact if it's only option available
      if (meta.canUsePactSlot && !meta.canUseSharedSlot)
        setSelectedPool("pact");
      else setSelectedPool("shared");

      setIsPreparingCast(true);
    };

    const handleConfirmCast = () => {
      /* TODO: Implement spell processing here */
      console.log(
        `Casting at level ${selectedCastLevel} using ${selectedPool} slot.`,
      );
      setIsPreparingCast(false);
    };

    if (isPreparingCast) {
      const needsPoolChoice = meta.canUseSharedSlot && meta.canUsePactSlot;
      const needsLevelChoice = meta.availableCastLevels.length > 1;

      return (
        <div className="action-controls-group casting-drawer fadeIn">
          {/* Level Selector */}
          {needsLevelChoice && (
            <div className="cast-level-selector">
              <span className="selector-label">Level:</span>
              <div className="level-beads">
                {meta.availableCastLevels.map((level) => (
                  <button
                    key={level}
                    className={`level-bead ${selectedCastLevel === level ? "active" : ""}`}
                    onClick={() => setSelectedCastLevel(level)}
                  >
                    {toRomanNumeral(level)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pool Selector */}
          {needsPoolChoice && (
            <div className="pool-selector">
              <button
                className={`pool-btn shared-btn ${selectedPool === "shared" ? "active" : ""}`}
                onClick={() => setSelectedPool("shared")}
              >
                Shared
              </button>
              <button
                className={`pool-btn pact-btn ${selectedPool === "pact" ? "active" : ""}`}
                onClick={() => setSelectedPool("pact")}
              >
                Pact
              </button>
            </div>
          )}

          {/* Confirm / Cancel */}
          <div className="cast-actions">
            <button
              className="action-btn cancel-btn"
              onClick={() => setIsPreparingCast(false)}
            >
              Cancel
            </button>
            <button
              className="action-btn confirm-cast-btn"
              onClick={handleConfirmCast}
            >
              Confirm Cast
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="action-controls-group spell-group">
        <span className="spell-level-badge">
          {toRomanNumeral(spellEntry.spellLevel)}
        </span>
        {spellEntry.attackRoll && renderAttackControls(spellEntry as any)}

        <button
          className="action-btn cast-btn"
          onClick={handleInitiateCast}
          disabled={!isCastable}
          title={spellEntry.spellMetadata?.unavailableReason}
        >
          {isCastable ? "Prepare Cast" : "Unavailable"}
        </button>
      </div>
    );
  };
  const renderTraitControls = (traitEntry: TraitUseActionEntry) => (
    <div className="action-controls-group trait-group">
      {traitEntry.uses && (
        <div className="trait-uses-tracker">
          <span className="uses-text">
            {traitEntry.uses.remaining} / {traitEntry.uses.total}
          </span>
        </div>
      )}
      <button
        className="action-btn use-btn"
        onClick={() => onExpendTraitUse?.(traitEntry.id)}
        disabled={traitEntry.uses ? traitEntry.uses.remaining <= 0 : false}
      >
        Use
      </button>
    </div>
  );

  return (
    <div className="combat-action-row">
      <div className="action-info">
        <span className="action-name">{entry.name}</span>
        {entry.subtitle && (
          <span className="action-subtitle">{entry.subtitle}</span>
        )}

        {/* Quick Stats */}
        {entry.quickStats && entry.quickStats.length > 0 && (
          <div className="quick-stats-row">
            {entry.quickStats.map((stat, i) => (
              <span key={i} className="quick-stat-pill">
                {stat}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="action-controls">
        {entry.source === "attack" && renderAttackControls(entry)}
        {entry.source === "spell" && renderSpellControls(entry)}
        {entry.source === "trait" && renderTraitControls(entry)}
      </div>
    </div>
  );
};
