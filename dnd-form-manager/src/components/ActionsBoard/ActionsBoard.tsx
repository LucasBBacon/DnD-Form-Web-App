/* eslint-disable @typescript-eslint/no-explicit-any */
import "./ActionsBoard.css";
import type { CombatActionEntry } from "../../hooks/useCombatActions";
import type { UseSpellcastingReturn } from "../../hooks/useSpellcasting";
import { CombatActionRow } from "./ui/CombatActionRow";
import { SpellSlotAbacus } from "./ui/SpellSlotAbacus";

export interface ActionsBoardProps {
  spellcasting: UseSpellcastingReturn;
  sections: Partial<
    Record<"action" | "bonus_action" | "reaction", CombatActionEntry[]>
  >;
  toRomanNumeral: (level: number) => string;

  attackRollModes: Record<string, "normal" | "advantage" | "disadvantage">;
  onAttackRollModeChange: (
    entryId: string,
    mode: "normal" | "advantage" | "disadvantage",
  ) => void;
  onAttackResult: (
    entryId: string,
    config: any,
    rolls: number[],
    mode: string,
  ) => void;
  onDamageResult: (
    entryId: string,
    damageId: string,
    config: any,
    total: number,
  ) => void;
  onCastSpell?: (entry: string) => void;
  onExpendTraitUse?: (entryId: string) => void;
}

const SECTION_ORDER = ["action", "bonus_action", "reaction"] as const;
const SECTION_LABELS = {
  action: "Actions",
  bonus_action: "Bonus Actions",
  reaction: "Reactions",
};

export const ActionsBoard: React.FC<ActionsBoardProps> = ({
  spellcasting,
  sections,
  toRomanNumeral,
  attackRollModes,
  onAttackRollModeChange,
  onAttackResult,
  onDamageResult,
  onCastSpell,
  onExpendTraitUse,
}) => {
  return (
    <div className="actions-board-container">
      {/* Sticky Combat HUD */}
      <div className="actions-hud-sticky">
        <h2 className="manuscript-section-title">Book of War</h2>

        {/* Only render the abacus if character is spellcaster */}
        {spellcasting.isSpellcaster && (
          <SpellSlotAbacus
            slots={spellcasting.slots}
            toRomanNumeral={toRomanNumeral}
          />
        )}

        <hr className="ornate-board-divider" />
      </div>

      {/* Scrollable Action Ledger */}
      <div className="actions-ledger-scroll-area">
        {SECTION_ORDER.map((sectionKey) => {
          const entries = sections[sectionKey];

          if (!entries || entries.length === 0) return null;

          return (
            <div key={sectionKey} className="action-economy-section">
              {/* Rubricated Section Header */}
              <div className="economy-header">
                <span className="economy-title">
                  {SECTION_LABELS[sectionKey]}
                </span>
                <span className="economy-flourish">~</span>
              </div>

              {/* Actions */}
              <div className="economy-list">
                {entries.map((entry) => (
                  <CombatActionRow
                    key={entry.id}
                    entry={entry}
                    attackRollMode={attackRollModes[entry.id] || "normal"}
                    onAttackRollModeChange={onAttackRollModeChange}
                    onAttackResult={onAttackResult}
                    onDamageResult={onDamageResult}
                    onCastSpell={onCastSpell}
                    onExpendTraitUse={onExpendTraitUse}
                    toRomanNumeral={toRomanNumeral}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty State Fallback */}
        {Object.values(sections).every((arr) => !arr || arr.length === 0) && (
          <div className="empty-state">
            <span className="empty-text">No combat actions available...</span>
          </div>
        )}
      </div>
    </div>
  );
};
