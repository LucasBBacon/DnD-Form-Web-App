import type React from "react";
import { useMemo, useState } from "react";
import {
  useCombatActions,
  type CombatRollMetadata,
} from "../../hooks/useCombatActions";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { AttackRangeSelection } from "./ui/RangeDistancePicker";
import type { VersatileMode } from "./ui/VersatileModeToggle";
import { ActionsBoardView } from "./ActionsBoardView";

/**
 * Main component for managing and displaying combat actions, spell slots, and rolls.
 * Connects to combat actions and character store hooks, and manages local UI state for active rollers and roll results.
 * @returns The ActionsBoard component.
 */
export const ActionsBoard: React.FC = () => {
  // #region State and Hooks

  const { spellcasting, sections, toRomanNumeral } = useCombatActions();
  const {
    expendTraitActionUse,
    restoreTraitActionUse,
    expendSpellSlot,
    expendPactSlot,
    removeInventoryItem,
    setWeaponVersatileMode,
  } = useCharacterStore();

  const [activeRoller, setActiveRoller] = useState<{
    entryId: string;
    kind: "attack" | "damage";
    damageId?: string;
  } | null>(null);
  const [attackRollModes, setAttackRollModes] = useState<
    Record<string, "normal" | "advantage" | "disadvantage">
  >({});
  const [attackRangeSelections, setAttackRangeSelections] = useState<
    Record<string, AttackRangeSelection>
  >({});
  const [versatileModeSelections, setVersatileModeSelections] = useState<
    Record<string, VersatileMode>
  >({});
  const [rollResultsByEntry, setRollResultsByEntry] = useState<
    Record<string, { attack?: string; damage: Record<string, string> }>
  >({});
  const [spellChoiceEntryId, setSpellChoiceEntryId] = useState<string | null>(
    null,
  );
  const [spellActionFeedbackByEntry, setSpellActionFeedbackByEntry] = useState<
    Record<string, string>
  >({});

  // #endregion

  // #region Handlers and Memoized Values

  const formatModifier = (modifier: number): string => {
    if (modifier === 0) return "";
    return modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
  };

  const setAttackResult = (
    entryId: string,
    mode: "normal" | "advantage" | "disadvantage",
  ) => void;
  onAttackResult: (
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

    // Resource consumption: ammo and thrown weapons decrement when damage is rolled.
    const allEntries = Object.values(sections).flat();
    const entry = allEntries.find((e) => e.id === entryId);
    if (entry?.ammo?.id && (entry.ammo.count ?? 0) > 0) {
      removeInventoryItem(entry.ammo.id, 1);
    }

    if (entry?.isThrown && entry.throwableItemId) {
      const remaining = entry.throwableCount;
      if (remaining == null || remaining > 0) {
        removeInventoryItem(entry.throwableItemId, 1);
      }
    }
  };

  const handleVersatileModeChange = (
    entryId: string,
    mode: VersatileMode,
  ) => {
    // Find the entry to get the instanceId
    const allEntries = Object.values(sections).flat();
    const entry = allEntries.find((e) => e.id === entryId);
    
    if (entry?.instanceId) {
      // Update the instance in the store with new versatile mode
      setWeaponVersatileMode(entry.instanceId, mode);
    }
    
    // Update local state for UI
    setVersatileModeSelections((prev) => ({
      ...prev,
      [entryId]: mode,
    }));
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

  const spellEntryById = useMemo(() => {
    const byId = new Map<string, (typeof sections)[keyof typeof sections][number]>();

    Object.values(sections).forEach((entries) => {
      (entries ?? []).forEach((entry) => {
        if (entry.source !== "spell") return;
        byId.set(entry.id, entry);
      });
    });

    return byId;
  }, [sections]);

  const clearSpellFeedback = (entryId: string) => {
    setSpellActionFeedbackByEntry((previous) => {
      if (!(entryId in previous)) return previous;
      const next = { ...previous };
      delete next[entryId];
      return next;
    });
  };

  const setSpellFeedback = (entryId: string, message: string) => {
    setSpellActionFeedbackByEntry((previous) => ({
      ...previous,
      [entryId]: message,
    }));
  };

  const consumeSpellSlotPool = (
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
    <ActionsBoardView
      slotHudRows={slotHud}
      sections={sections}
      activeRoller={activeRoller}
      attackRollModes={attackRollModes}
      attackRangeSelections={attackRangeSelections}
      versatileModeSelections={versatileModeSelections}
      rollResultsByEntry={rollResultsByEntry}
      onActiveRollerChange={setActiveRoller}
      onAttackRollModeChange={(entryId, mode) => {
        // Heavy entries are locked to disadvantage — ignore any override
        const allEntries = Object.values(sections).flat();
        const entry = allEntries.find((e) => e.id === entryId);
        if (entry?.heavyDisadvantage) return;
        setAttackRollModes((prev) => ({ ...prev, [entryId]: mode }));
      }}
      onAttackRangeChange={(entryId, rangeSelection) => {
        setAttackRangeSelections((prev) => ({
          ...prev,
          [entryId]: rangeSelection,
        }));
      }}
      onVersatileModeChange={handleVersatileModeChange}
      onAttackResult={setAttackResult}
      onDamageResult={setDamageResult}
      onAmmoConsume={removeInventoryItem}
      onExpendTraitUse={expendTraitActionUse}
      onRestoreTraitUse={restoreTraitActionUse}
      spellChoiceEntryId={spellChoiceEntryId}
      spellActionFeedbackByEntry={spellActionFeedbackByEntry}
      onCastSpell={(entryId) => {
        const entry = spellEntryById.get(entryId);
        if (!entry || entry.source !== "spell") return;

        if (!entry.spellCast?.canCast) {
          setSpellFeedback(
            entryId,
            entry.spellCast?.unavailableReason || "No compatible spell slot available.",
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
