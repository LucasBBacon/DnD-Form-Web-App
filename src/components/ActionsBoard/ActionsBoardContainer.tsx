/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useMemo, useState } from "react";
import type {
  AttackActionEntry,
  CombatActionEntry,
  CombatRollMetadata,
} from "../../hooks/useCombatActions";
import { useCombatActions } from "../../hooks/useCombatActions";
import { useCharacterStore } from "../../store/useCharacterStore";
import { ActionsBoard } from "./ActionsBoard";

type AttackRollMode = "normal" | "advantage" | "disadvantage";

const stripTraitPrefix = (entryId: string): string =>
  entryId.startsWith("trait:") ? entryId.slice("trait:".length) : entryId;

const stripSpellPrefix = (entryId: string): string =>
  entryId.startsWith("spell:") ? entryId.slice("spell:".length) : entryId;

export const ActionsBoardContainer: React.FC = () => {
  const store = useCharacterStore();
  const { spellcasting, sections, toRomanNumeral } = useCombatActions();
  const [attackRollModes, setAttackRollModes] = useState<
    Record<string, AttackRollMode>
  >({});

  const entriesById = useMemo(() => {
    const entries = Object.values(sections).flatMap(
      (sectionEntries) => sectionEntries ?? [],
    );
    const byId = new Map<string, CombatActionEntry>();
    entries.forEach((entry) => {
      byId.set(entry.id, entry);
    });
    return byId;
  }, [sections]);

  const handleCastSpell = (entryId: string) => {
    const spellId = stripSpellPrefix(entryId);
    const metadata = spellcasting.spellMetadata?.byId[spellId];
    if (!metadata || !metadata.canCast || metadata.selectedCastLevel <= 0) {
      return;
    }

    if (metadata.canUseSharedSlot) {
      store.expendSpellSlot(metadata.selectedCastLevel);
      return;
    }

    if (metadata.canUsePactSlot) {
      store.expendPactSlot();
    }
  };

  return (
    <ActionsBoard
      spellcasting={spellcasting}
      sections={sections}
      toRomanNumeral={toRomanNumeral}
      attackRollModes={attackRollModes}
      onAttackRollModeChange={(entryId, mode) => {
        setAttackRollModes((previous) => ({
          ...previous,
          [entryId]: mode,
        }));
      }}
      onAttackResult={(_entryId, _config, _rolls, _mode) => {
        // Reserved for integrating roll history/logging panel.
      }}
      onDamageResult={(
        entryId: string,
        _damageId: string,
        _config: CombatRollMetadata,
        _total: number,
      ) => {
        const entry = entriesById.get(entryId);
        if (!entry || entry.source !== "attack") return;

        const attackEntry = entry as AttackActionEntry;

        if (attackEntry.isThrown && attackEntry.throwableItemId) {
          store.removeInventoryItem(attackEntry.throwableItemId, 1);
        }
      }}
      onCastSpell={handleCastSpell}
      onExpendTraitUse={(entryId: string) => {
        store.expendTraitActionUse(stripTraitPrefix(entryId));
      }}
    />
  );
};
