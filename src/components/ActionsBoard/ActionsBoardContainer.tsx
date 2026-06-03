import type React from "react";
import { useMemo, useState } from "react";
import type {
  AttackActionEntry,
  CombatActionEntry,
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
  const removeInventoryItem = useCharacterStore(
    (state) => state.removeInventoryItem,
  );
  const expendSpellSlot = useCharacterStore((state) => state.expendSpellSlot);
  const expendPactSlot = useCharacterStore((state) => state.expendPactSlot);
  const expendTraitActionUse = useCharacterStore(
    (state) => state.expendTraitActionUse,
  );

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
      expendSpellSlot(metadata.selectedCastLevel);
      return;
    }

    if (metadata.canUsePactSlot) {
      expendPactSlot();
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
      onAttackResult={() => {
        // Reserved for integrating roll history/logging panel.
      }}
      onDamageResult={(entryId: string) => {
        const entry = entriesById.get(entryId);
        if (!entry || entry.source !== "attack") return;

        const attackEntry = entry as AttackActionEntry;

        if (attackEntry.isThrown && attackEntry.throwableItemId) {
          removeInventoryItem(attackEntry.throwableItemId, 1);
        }
      }}
      onCastSpell={handleCastSpell}
      onExpendTraitUse={(entryId: string) => {
        expendTraitActionUse(stripTraitPrefix(entryId));
      }}
    />
  );
};
