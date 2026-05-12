import type React from "react";
import { useMemo, useState } from "react";
import {
  useCombatActions,
  type CombatRollMetadata,
} from "../../hooks/useCombatActions";
import { useCharacterStore } from "../../store/useCharacterStore";
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
  } = useCharacterStore();

  const [activeRoller, setActiveRoller] = useState<{
    entryId: string;
    kind: "attack" | "damage";
    damageId?: string;
  } | null>(null);
  const [attackRollModes, setAttackRollModes] = useState<
    Record<string, "normal" | "advantage" | "disadvantage">
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getAttackRollMode = (entryId: string) =>
    attackRollModes[entryId] ?? "normal";

  const formatModifier = (modifier: number): string => {
    if (modifier === 0) return "";
    return modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
  };

  const setAttackResult = (
    entryId: string,
    config: CombatRollMetadata,
    rolls: number[],
    mode: "normal" | "advantage" | "disadvantage",
  ) => {
    const first = rolls[0] ?? 0;
    const second = rolls[1] ?? 0;
    const keptValue =
      mode === "normal"
        ? first
        : mode === "advantage"
          ? Math.max(first, second)
          : Math.min(first, second);

    const total = keptValue + config.modifier;
    const critLabel =
      keptValue === 20
        ? " (critical success)"
        : keptValue === 1
          ? " (critical fail)"
          : "";

    const rollPart =
      mode === "normal"
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
    pool: "shared" | "pact",
  ) => {
    const entry = spellEntryById.get(entryId);
    if (!entry || entry.source !== "spell") return;
    if (entry.spellLevel === 0) return;

    if (pool === "shared") {
      if (!entry.spellCast?.canUseSharedSlot || typeof entry.spellLevel !== "number") {
        setSpellFeedback(
          entryId,
          entry.spellCast?.unavailableReason || "No compatible spell slot available.",
        );
        return;
      }
      expendSpellSlot(entry.spellLevel);
      clearSpellFeedback(entryId);
      return;
    }

    if (!entry.spellCast?.canUsePactSlot) {
      setSpellFeedback(
        entryId,
        entry.spellCast?.unavailableReason || "No compatible spell slot available.",
      );
      return;
    }

    expendPactSlot();
    clearSpellFeedback(entryId);
  };

  // #endregion

  return (
    <ActionsBoardView
      slotHudRows={slotHud}
      sections={sections}
      activeRoller={activeRoller}
      attackRollModes={attackRollModes}
      rollResultsByEntry={rollResultsByEntry}
      onActiveRollerChange={setActiveRoller}
      onAttackRollModeChange={(entryId, mode) => {
        setAttackRollModes((prev) => ({ ...prev, [entryId]: mode }));
      }}
      onAttackResult={setAttackResult}
      onDamageResult={setDamageResult}
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
          setSpellChoiceEntryId(null);
          return;
        }

        if (entry.spellLevel === 0) {
          clearSpellFeedback(entryId);
          setSpellChoiceEntryId(null);
          return;
        }

        const canUseShared = entry.spellCast.canUseSharedSlot;
        const canUsePact = entry.spellCast.canUsePactSlot;

        if (canUseShared && canUsePact) {
          setSpellChoiceEntryId(entryId);
          clearSpellFeedback(entryId);
          return;
        }

        if (canUseShared) {
          consumeSpellSlotPool(entryId, "shared");
          setSpellChoiceEntryId(null);
          return;
        }

        if (canUsePact) {
          consumeSpellSlotPool(entryId, "pact");
          setSpellChoiceEntryId(null);
          return;
        }

        setSpellFeedback(
          entryId,
          entry.spellCast.unavailableReason || "No compatible spell slot available.",
        );
      }}
      onChooseSpellSlotPool={(entryId, pool) => {
        consumeSpellSlotPool(entryId, pool);
        setSpellChoiceEntryId(null);
      }}
      onCancelSpellSlotChoice={(entryId) => {
        if (spellChoiceEntryId === entryId) {
          setSpellChoiceEntryId(null);
        }
      }}
      toRomanNumeral={toRomanNumeral}
    />
  );
};
