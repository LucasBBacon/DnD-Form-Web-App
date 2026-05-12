import type { UseSpellcastingReturn } from "../../hooks/useSpellcasting";

const baseSpellcasting: UseSpellcastingReturn = {
  isSpellcaster: true,
  canCastSpells: true,
  casting: {
    ability: "int",
    preparationType: "prepared",
    saveDC: 15,
    attackBonus: 7,
  },
  pools: {
    known: { selected: ["spell_magic_missile", "spell_detect_magic"], max: 6 },
    prepared: { selected: ["spell_magic_missile"], max: 4 },
    cantrips: { max: 3 },
    bonusPrepared: [],
    allExpandedSpellIds: [],
    freeSchoolDesignated: [],
    freeSchoolSlots: 0,
    innate: [],
  },
  slots: {
    shared: {
      1: { total: 4, expended: 1 },
      2: { total: 2, expended: 0 },
    },
    pact: null,
  },
  diagnostics: {
    selections: {
      invalidKnownSpellIds: [],
      invalidPreparedSpellIds: [],
      knownSpellOverflow: 0,
      preparedSpellOverflow: 0,
      freeSchoolOverflow: 0,
    },
    classBreakdown: [
      {
        classId: "class_wizard",
        classLevel: 5,
        preparationType: "prepared",
        spellcastingAbility: "int",
        maxSpellLevel: 3,
        maxCantrips: 3,
        maxSpellsKnown: 0,
        maxPreparedSpells: 6,
        schoolRestrictions: null,
        expandedSpellIds: [],
        spellListSource: null,
        freeSchoolSpellSlots: 0,
      },
    ],
  },
};

export const SPELLBOOK_BOARD_FIXTURES: Record<string, UseSpellcastingReturn> = {
  preparedCaster: baseSpellcasting,
  armorBlocked: {
    ...baseSpellcasting,
    canCastSpells: false,
  },
  pactCaster: {
    ...baseSpellcasting,
    casting: {
      ability: "cha",
      preparationType: "pact",
      saveDC: 16,
      attackBonus: 8,
    },
    slots: {
      shared: {},
      pact: { level: 3, total: 2, expended: 1 },
    },
    diagnostics: {
      ...baseSpellcasting.diagnostics,
      classBreakdown: [
        {
          classId: "class_warlock",
          classLevel: 5,
          preparationType: "pact",
          spellcastingAbility: "cha",
          maxSpellLevel: 3,
          maxCantrips: 3,
          maxSpellsKnown: 6,
          maxPreparedSpells: 0,
          schoolRestrictions: null,
          expandedSpellIds: [],
          spellListSource: null,
          freeSchoolSpellSlots: 0,
        },
      ],
    },
  },
  withInnateSpells: {
    ...baseSpellcasting,
    pools: {
      ...baseSpellcasting.pools,
      innate: [
        {
          spellId: "spell_light",
          spellName: "Light",
          isResolvedSpell: true,
          sourceTraitName: "Starlit Bloodline",
          spellSaveDC: 14,
          spellAttackBonus: 6,
        },
      ],
    },
  },
};
