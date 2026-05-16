import type React from "react";
import "./CombatActionRow.css";
import { DiceRoller } from "../../ui/DiceRoller/DiceRoller";

export type ActionKind = "attack" | "spell_save" | "trait_use";

export interface BaseActionEntry {
  id: string;
  name: string;
  kind: ActionKind;
  subtitle: string;
}

export interface AttackActionEntry extends BaseActionEntry {
  kind: "attack";
  attackModifier: number;
  damageDice: string;
  damageModifier: number;
  damageType: string;
}

export interface SpellSaveActionEntry extends BaseActionEntry {
  kind: "spell_save";
  saveDc: number;
  saveAbility: string;
  damageDice?: string;
}

export interface TraitUseActionEntry extends BaseActionEntry {
  kind: "trait_use";
  currentUses: number;
  maxUses: number;
}

export type CombatActionEntry =
  | AttackActionEntry
  | SpellSaveActionEntry
  | TraitUseActionEntry;

export interface CombatActionRowProps {
  entry: CombatActionEntry;
  onAttackResult: (entryId: string, total: number) => void;
  onDamageResult: (entryId: string, total: number) => void;
  onCastSpell?: (entryId: string) => void;
  onExpendTraitUse?: (entryId: string) => void;
}

export const CombatActionRow: React.FC<CombatActionRowProps> = ({
  entry,
  onAttackResult,
  onDamageResult,
  onCastSpell,
  onExpendTraitUse,
}) => {
  const renderAttackControls = (attackEntry: AttackActionEntry) => (
    <div className="action-controls-group attack-group">
      {/* TODO: Add Advantage/Disadvantage toggle */}
      <DiceRoller
        sides={20}
        count={1}
        rollLabel={`To Hit (+${attackEntry.attackModifier})`}
        onRollComplete={(rolls, summary) =>
          onAttackResult(entry.id, summary.total + attackEntry.attackModifier)
        }
        className="attack-roller"
      />

      <DiceRoller
        sides={8}
        count={1}
        rollLabel={`Dmg (${attackEntry.damageDice}+${attackEntry.damageModifier})`}
        onRollComplete={(rolls, summary) =>
          onAttackResult(entry.id, summary.total + attackEntry.damageModifier)
        }
        className="damage-roller"
      />
    </div>
  );
  const renderSpellSaveControls = (spellEntry: SpellSaveActionEntry) => (
    <div className="action-controls-group spell-group">
      <div className="save-dc-badge">
        DC {spellEntry.saveDc} {spellEntry.saveAbility.toUpperCase()}
      </div>
      {spellEntry.damageDice && (
        <DiceRoller
          sides={6}
          count={8}
          rollLabel={`Dmg (+${spellEntry.damageDice})`}
          onRollComplete={(rolls, summary) =>
            onDamageResult(entry.id, summary.total)
          }
          className="attack-roller "
        />
      )}
      <button
        className="action-btn cast-btn"
        onClick={() => onCastSpell?.(entry.id)}
      >
        Cast
      </button>
    </div>
  );
  const renderTraitControls = (traitEntry: TraitUseActionEntry) => (
    <div className="action-controls-group trait-group">
      <div className="trait-uses-tracker">
        {/* TODO: Reuse Wax seal tracker from Features */}
        <span className="uses-text">
          {traitEntry.currentUses} / {traitEntry.maxUses}
        </span>

        <button
          className="action-btn use-btn"
          onClick={() => onExpendTraitUse?.(entry.id)}
          disabled={traitEntry.currentUses <= 0}
        >
          Use
        </button>
      </div>
    </div>
  );

  return (
    <div className="combat-action-row">
      <div className="action-info">
        <span className="action-name">{entry.name}</span>
        <span className="action-subtitle">{entry.subtitle}</span>
      </div>

      <div className="action-controls">
        {entry.kind === "attack" && renderAttackControls(entry)}
        {entry.kind === "spell_save" && renderSpellSaveControls(entry)}
        {entry.kind === "trait_use" && renderTraitControls(entry)}
      </div>
    </div>
  );
};
