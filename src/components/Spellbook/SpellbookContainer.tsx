import type React from "react";
import { useMemo } from "react";
import { getSpellByID } from "../../data/staticDataApi";
import { useSpellcasting } from "../../hooks/useSpellcasting";
import {
  Spellbook,
  type SpellbookEntry,
  type SpellReferenceData,
} from "./Spellbook";

const toRomanNumeral = (level: number): string => {
  if (level <= 0) return "";

  const map: ReadonlyArray<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let value = level;
  let result = "";

  map.forEach(([decimal, numeral]) => {
    while (value >= decimal) {
      value -= decimal;
      result += numeral;
    }
  });

  return result;
};

const mapReference = (spellId: string): SpellReferenceData | null => {
  const spell = getSpellByID(spellId);
  if (!spell) return null;

  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: {
      vocal: spell.components.vocal,
      somatic: spell.components.somatic,
      material: spell.components.material
        ? spell.components.materialMaterials ?? "Material Component"
        : null,
    },
    duration: spell.duration,
    description: spell.lore.fullText,
    highLevelsText: spell.lore.higherLevel,
  };
};

export const SpellbookContainer: React.FC = () => {
  const spellcasting = useSpellcasting();

  const entries = useMemo<SpellbookEntry[]>(() => {
    const knownSpellIds = spellcasting.pools.known.selected;
    const preparedSpellIds = spellcasting.pools.prepared.selected;
    const alwaysPreparedSpellIds = spellcasting.pools.bonusPrepared;
    const innateSpellIds = spellcasting.pools.innate.map((entry) => entry.spellId);

    const activeSpellIds = Array.from(
      new Set([
        ...knownSpellIds,
        ...preparedSpellIds,
        ...alwaysPreparedSpellIds,
        ...innateSpellIds,
      ]),
    );

    return activeSpellIds
      .map((spellId): SpellbookEntry | null => {
        const reference = mapReference(spellId);
        if (!reference) return null;

        const isAlwaysPrepared = alwaysPreparedSpellIds.includes(spellId);
        const metadata = spellcasting.spellMetadata?.byId[spellId];

        return {
          reference,
          ...(metadata ? { metadata } : {}),
          isKnown: knownSpellIds.includes(spellId),
          isPrepared: preparedSpellIds.includes(spellId) || isAlwaysPrepared,
          isAlwaysPrepared,
        } satisfies SpellbookEntry;
      })
      .filter((entry): entry is SpellbookEntry => entry !== null);
  }, [
    spellcasting.pools.bonusPrepared,
    spellcasting.pools.innate,
    spellcasting.pools.known.selected,
    spellcasting.pools.prepared.selected,
    spellcasting.spellMetadata?.byId,
  ]);

  return <Spellbook entries={entries} toRomanNumeral={toRomanNumeral} />;
};
