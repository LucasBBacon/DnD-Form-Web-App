import type React from "react";
import "./WizardPickerStage.css";
import { useMemo } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAllSpells, getSpellByID } from "../../data/staticDataApi";
import { useSpellcasting } from "../../hooks/useSpellcasting";
import {
  WizardSpellSelectionStageView,
  type WizardSpellOption,
} from "./WizardSpellSelectionStageView";

export const WizardSpellSelectionStage: React.FC = () => {
  const classId = useCharacterStore((s) => s.classId);
  const spellsKnown = useCharacterStore((s) => s.spellsKnown);
  const spellsPrepared = useCharacterStore((s) => s.spellsPrepared);
  const learnSpell = useCharacterStore((s) => s.learnSpell);
  const unlearnSpell = useCharacterStore((s) => s.unlearnSpell);
  const prepareSpell = useCharacterStore((s) => s.prepareSpell);
  const unprepareSpell = useCharacterStore((s) => s.unprepareSpell);

  const { isSpellcaster, pools, casting } = useSpellcasting();

  const isPreparedCaster = casting.preparationType === "prepared";

  // Filter the full spell list to this class's available spells.
  // Exclude always-prepared domain spells (they're shown in their own locked section).
  // Include any spells added via expandedSpellIds (off-list spells that can be manually prepared).
  const classSpells = useMemo(() => {
    if (!classId) return [];
    const bonusPreparedSet = new Set(pools.bonusPrepared);
    const baseSpells = getAllSpells().filter(
      (spell) => spell.classes?.includes(classId) && !bonusPreparedSet.has(spell.id),
    );
    const baseIds = new Set(baseSpells.map((s) => s.id));
    const expandedOnly = pools.allExpandedSpellIds
      .filter((id) => !baseIds.has(id) && !bonusPreparedSet.has(id))
      .map((id) => getAllSpells().find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => s != null);
    return [...baseSpells, ...expandedOnly];
  }, [classId, pools.bonusPrepared, pools.allExpandedSpellIds]);

  const cantrips = useMemo(
    () => classSpells.filter((s) => s.level === 0),
    [classSpells],
  );

  const spells = useMemo(
    () => classSpells.filter((s) => s.level > 0),
    [classSpells],
  );

  // Current selection counts
  const chosenCantrips = spellsKnown.filter((id) => {
    const spell = getSpellByID(id);
    return spell != null && spell.level === 0;
  });

  const chosenKnownSpells = spellsKnown.filter((id) => {
    const spell = getSpellByID(id);
    return spell != null && spell.level > 0;
  });

  const cantripMax = pools.cantrips.max;
  const knownMax = pools.known.max;
  const preparedMax = pools.prepared.max;
  // Count only manually prepared spells (exclude always-prepared domain spells)
  const bonusPreparedSet = new Set(pools.bonusPrepared);
  const manualPreparedCount = spellsPrepared.filter((id) => !bonusPreparedSet.has(id)).length;

  const handleCantripClick = (spellId: string) => {
    if (chosenCantrips.includes(spellId)) {
      unlearnSpell(spellId);
    } else if (chosenCantrips.length < cantripMax) {
      learnSpell(spellId);
    }
  };

  const handleSpellClick = (spellId: string) => {
    if (isPreparedCaster) {
      // Prepared casters toggle prepared list
      if (spellsPrepared.includes(spellId)) {
        unprepareSpell(spellId);
      } else if (manualPreparedCount < preparedMax) {
        prepareSpell(spellId);
      }
    } else {
      // Known/pact casters toggle known list
      if (chosenKnownSpells.includes(spellId)) {
        unlearnSpell(spellId);
      } else if (chosenKnownSpells.length < knownMax) {
        learnSpell(spellId);
      }
    }
  };

  const toViewOption = (spell: (typeof classSpells)[number]): WizardSpellOption => ({
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
  });

  const bonusPreparedSpells = pools.bonusPrepared
    .map((spellId) => getSpellByID(spellId))
    .filter((spell): spell is NonNullable<typeof spell> => spell != null)
    .map(toViewOption);

  return (
    <WizardSpellSelectionStageView
      classSelected={!!classId}
      isSpellcaster={isSpellcaster}
      isPreparedCaster={isPreparedCaster}
      cantrips={cantrips.map(toViewOption)}
      spells={spells.map(toViewOption)}
      bonusPreparedSpells={bonusPreparedSpells}
      selectedCantripIds={chosenCantrips}
      selectedSpellIds={isPreparedCaster ? spellsPrepared : chosenKnownSpells}
      cantripMax={cantripMax}
      spellMax={isPreparedCaster ? preparedMax : knownMax}
      spellCountLabel={isPreparedCaster ? "prepared" : "known"}
      onCantripToggle={handleCantripClick}
      onSpellToggle={handleSpellClick}
    />
  );
};
