import type React from "react";
import { useMemo, useState } from "react";
import {
  useCombatActions,
  type CombatRollMetadata,
} from "../../hooks/useCombatActions";
import { useCharacterStore } from "../../store/useCharacterStore";
import { ActionsBoardView } from "./ActionsBoardView";

/**
 * Hook wrapper for ActionsBoardView.
 * Handles all hook subscriptions and state management,
 * then passes everything to the presentational view component.
 */
export const ActionsBoard: React.FC = () => {
  const { spellcasting, sections, toRomanNumeral } = useCombatActions();
  const { expendTraitActionUse, restoreTraitActionUse } = useCharacterStore();

  const [activeRoller, setActiveRoller] = useState<
    { entryId: string; kind: "attack" | "damage"; damageId?: string } | null
  >(null);
  const [attackRollModes, setAttackRollModes] = useState<
    Record<string, "attack" | "damage">
  >({});
  const [rollResultsByEntry, setRollResultsByEntry] = useState<
    Record<string, { attack?: string; damage: Record<string, string> }>
  >({});

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
    mode: "normal" | "advantage" | "disadvantage"
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
    rollTotal: number
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
        0
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
      toRomanNumeral={toRomanNumeral}
    />
  );
};
