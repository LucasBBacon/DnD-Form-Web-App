/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "./useCharacterStats";
import {
  getAllSpells,
  getClassById,
  getRaceById,
  getSpellByID,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { useSpellcasting } from "./useSpellcasting";

vi.mock("../store/useCharacterStore");
vi.mock("../data/staticDataApi");
vi.mock("../utils/traitUtils");
vi.mock("./useCharacterStats");

describe("useSpellcasting innate spell enrichment", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCharacterStore).mockReturnValue({
      level: 1,
      raceId: "race_test",
      subraceId: null,
      classId: null,
      subclassId: null,
      classTracks: [],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(useCharacterStats).mockReturnValue({
      abilities: {
        scores: {
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 14,
        },
        modifiers: {
          str: 0,
          dex: 0,
          con: 0,
          int: 0,
          wis: 0,
          cha: 2,
        },
      },
      combat: {
        proficiencyBonus: 2,
        hp: { max: 8, current: 8 },
        initiative: 0,
        armorClass: 10,
        isArmorPenalized: false,
        speed: 30,
      },
      encumbrance: {
        totalWeight: 0,
        carryingCapacity: 150,
        isEncumbered: false,
      },
    } as any);

    vi.mocked(getClassById).mockReturnValue(null);
    vi.mocked(getSubclassById).mockReturnValue(null);
    vi.mocked(getAllSpells).mockReturnValue([] as any);
    vi.mocked(getTraitsByIds).mockReturnValue([] as any);
  });

  it("resolves innate spell name when spellId exists", () => {
    vi.mocked(getAllCharacterTraits).mockReturnValue([
      {
        id: "trait_test",
        name: "Test Trait",
        lore: { shortDescription: "test" },
        effects: [
          {
            type: "spell_grant",
            target: "spell_mage_hand",
            levelAvailable: 1,
            spellcastingAbility: "cha",
          },
        ],
      },
    ] as any);

    vi.mocked(getSpellByID).mockReturnValue({
      id: "spell_mage_hand",
      name: "Mage Hand",
    } as any);

    const result = useSpellcasting();

    expect(result.pools.innate).toHaveLength(1);
    expect(result.pools.innate[0].spellId).toBe("spell_mage_hand");
    expect(result.pools.innate[0].spellName).toBe("Mage Hand");
    expect(result.pools.innate[0].isResolvedSpell).toBe(true);
  });

  it("uses debug-friendly fallback when spellId is unknown", () => {
    vi.mocked(getAllCharacterTraits).mockReturnValue([
      {
        id: "trait_test",
        name: "Test Trait",
        lore: { shortDescription: "test" },
        effects: [
          {
            type: "spell_grant",
            target: "spell_missing",
            levelAvailable: 1,
          },
        ],
      },
    ] as any);

    vi.mocked(getSpellByID).mockReturnValue(null);

    const result = useSpellcasting();

    expect(result.pools.innate).toHaveLength(1);
    expect(result.pools.innate[0].spellId).toBe("spell_missing");
    expect(result.pools.innate[0].spellName).toBe(
      "Unknown Spell (spell_missing)",
    );
    expect(result.pools.innate[0].isResolvedSpell).toBe(false);
  });
});

describe("useSpellcasting progression resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCharacterStore).mockReturnValue({
      level: 4,
      raceId: null,
      subraceId: null,
      classId: "class_wizard",
      subclassId: null,
      classTracks: [{ classId: "class_wizard", subclassId: null, level: 4 }],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(useCharacterStats).mockReturnValue({
      abilities: {
        scores: {
          str: 10,
          dex: 10,
          con: 10,
          int: 16,
          wis: 12,
          cha: 10,
        },
        modifiers: {
          str: 0,
          dex: 0,
          con: 0,
          int: 3,
          wis: 1,
          cha: 0,
        },
      },
      combat: {
        proficiencyBonus: 2,
        hp: { max: 20, current: 20 },
        initiative: 0,
        armorClass: 10,
        isArmorPenalized: false,
        speed: 30,
      },
      encumbrance: {
        totalWeight: 0,
        carryingCapacity: 150,
        isEncumbered: false,
      },
    } as any);

    vi.mocked(getAllCharacterTraits).mockReturnValue([] as any);
    vi.mocked(getSpellByID).mockReturnValue(null);
    vi.mocked(getSubclassById).mockReturnValue(null);
    vi.mocked(getAllSpells).mockReturnValue([] as any);
    vi.mocked(getTraitsByIds).mockReturnValue([] as any);
  });

  it("uses the latest class progression at or below current level", () => {
    vi.mocked(getClassById).mockReturnValue({
      progression: [
        { level: 1, features: ["trait_test_spellcasting"] },
        { level: 3, features: [] },
        { level: 5, features: [] },
      ],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        id: "trait_test_spellcasting",
        spellcasting: {
          ability: "int",
          preparationType: "known",
          ritualCasting: false,
          progressionByLevel: [
            { level: 1, cantripsKnown: 2, spellsKnown: 3 },
            { level: 3, cantripsKnown: 3, spellsKnown: 4 },
            { level: 5, cantripsKnown: 4, spellsKnown: 6 },
          ],
        },
      },
    ] as any);

    const result = useSpellcasting();

    expect(result.pools.cantrips.max).toBe(3);
    expect(result.pools.known.max).toBe(4);
  });

  it("picks spellcasting from subclass trait when present", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      level: 6,
      raceId: null,
      subraceId: null,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [
        {
          classId: "class_fighter",
          subclassId: "subclass_eldritch_knight",
          level: 6,
        },
      ],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      progression: [{ level: 1, features: [] }],
    } as any);

    vi.mocked(getSubclassById).mockReturnValue({
      progression: [
        { level: 3, features: ["trait_ek_spellcasting"] },
        { level: 6, features: [] },
      ],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        id: "trait_ek_spellcasting",
        spellcasting: {
          ability: "int",
          preparationType: "known",
          ritualCasting: false,
          progressionByLevel: [
            { level: 3, cantripsKnown: 1, spellsKnown: 3 },
            { level: 6, cantripsKnown: 2, spellsKnown: 4 },
          ],
        },
      },
    ] as any);

    const result = useSpellcasting();

    expect(result.pools.cantrips.max).toBe(2);
    expect(result.pools.known.max).toBe(4);
    expect(result.casting.ability).toBe("int");
  });

  it("ignores non-spellcasting subclass traits and uses class trait", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      level: 5,
      raceId: null,
      subraceId: null,
      classId: "class_wizard",
      subclassId: "subclass_noncaster",
      classTracks: [
        {
          classId: "class_wizard",
          subclassId: "subclass_noncaster",
          level: 5,
        },
      ],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      progression: [{ level: 1, features: ["trait_wiz_spellcasting"] }],
    } as any);

    vi.mocked(getSubclassById).mockReturnValue({
      progression: [{ level: 3, features: [] }],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        id: "trait_wiz_spellcasting",
        spellcasting: {
          ability: "int",
          preparationType: "prepared",
          ritualCasting: true,
          progressionByLevel: [
            { level: 1, cantripsKnown: 3, spellsKnown: 6 },
          ],
        },
      },
    ] as any);

    const result = useSpellcasting();

    expect(result.pools.cantrips.max).toBe(3);
    expect(result.pools.known.max).toBe(6);
    expect(result.casting.ability).toBe("int");
  });

  it("computes shared slots from strict multiclass caster level", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      level: 5,
      raceId: null,
      subraceId: null,
      classId: "class_wizard",
      subclassId: null,
      classTracks: [
        { classId: "class_wizard", subclassId: null, level: 3 },
        { classId: "class_cleric", subclassId: null, level: 2 },
      ],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: { 1: 1, 2: 1, 3: 0 },
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockImplementation((id) => {
      if (id === "class_wizard") {
        return {
          progression: [
            { level: 3, features: ["trait_wiz_spellcasting"] },
          ],
        } as any;
      }

      if (id === "class_cleric") {
        return {
          progression: [
            { level: 2, features: ["trait_cleric_spellcasting"] },
          ],
        } as any;
      }

      return null;
    });

    vi.mocked(getTraitsByIds).mockImplementation((ids) => {
      if (ids.includes("trait_wiz_spellcasting")) {
        return [
          {
            id: "trait_wiz_spellcasting",
            spellcasting: {
              ability: "int",
              preparationType: "prepared",
              ritualCasting: true,
              progressionByLevel: [
                { level: 3, cantripsKnown: 3, spellSlots: { 1: 4, 2: 2 } },
              ],
            },
          },
        ] as any;
      }
      if (ids.includes("trait_cleric_spellcasting")) {
        return [
          {
            id: "trait_cleric_spellcasting",
            spellcasting: {
              ability: "wis",
              preparationType: "prepared",
              ritualCasting: true,
              progressionByLevel: [
                { level: 2, cantripsKnown: 3, spellSlots: { 1: 3 } },
              ],
            },
          },
        ] as any;
      }
      return [] as any;
    });

    const result = useSpellcasting();

    expect(result.slots.shared).toEqual({
      1: { total: 4, expended: 1 },
      2: { total: 3, expended: 1 },
      3: { total: 2, expended: 0 },
    });
    expect(result.slots.pact).toBeNull();
  });

  it("returns pact and shared slots independently in warlock multiclass", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      level: 5,
      raceId: null,
      subraceId: null,
      classId: "class_warlock",
      subclassId: null,
      classTracks: [
        { classId: "class_warlock", subclassId: null, level: 3 },
        { classId: "class_bard", subclassId: null, level: 2 },
      ],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: { 1: 1 },
      expendedPactSlots: 1,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockImplementation((id) => {
      if (id === "class_warlock") {
        return {
          progression: [
            { level: 3, features: ["trait_pact_magic"] },
          ],
        } as any;
      }

      if (id === "class_bard") {
        return {
          progression: [
            { level: 2, features: ["trait_bard_spellcasting"] },
          ],
        } as any;
      }

      return null;
    });

    vi.mocked(getTraitsByIds).mockImplementation((ids) => {
      if (ids.includes("trait_pact_magic")) {
        return [
          {
            id: "trait_pact_magic",
            spellcasting: {
              ability: "cha",
              preparationType: "pact",
              ritualCasting: false,
              progressionByLevel: [
                { level: 3, cantripsKnown: 2, spellsKnown: 4, spellSlots: { 2: 2 } },
              ],
            },
          },
        ] as any;
      }
      if (ids.includes("trait_bard_spellcasting")) {
        return [
          {
            id: "trait_bard_spellcasting",
            spellcasting: {
              ability: "cha",
              preparationType: "known",
              ritualCasting: true,
              progressionByLevel: [
                { level: 2, cantripsKnown: 2, spellsKnown: 5, spellSlots: { 1: 3 } },
              ],
            },
          },
        ] as any;
      }
      return [] as any;
    });

    const result = useSpellcasting();

    expect(result.slots.shared).toEqual({
      1: { total: 3, expended: 1 },
    });
    expect(result.slots.pact).toEqual({
      level: 2,
      total: 2,
      expended: 1,
    });
  });

  it("surfaces spell legality diagnostics for known and prepared pools", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      level: 4,
      raceId: null,
      subraceId: null,
      classId: "class_wizard",
      subclassId: null,
      classTracks: [{ classId: "class_wizard", subclassId: null, level: 4 }],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: ["spell_magic_missile", "spell_healing_word"],
      spellsKnown: ["spell_magic_missile", "spell_healing_word"],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      progression: [
        { level: 4, features: ["trait_wiz_spellcasting"] },
      ],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        id: "trait_wiz_spellcasting",
        spellcasting: {
          ability: "int",
          preparationType: "prepared",
          ritualCasting: true,
          progressionByLevel: [
            { level: 4, cantripsKnown: 3, spellsKnown: 0, spellSlots: { 1: 4, 2: 3 } },
          ],
        },
      },
    ] as any);

    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_magic_missile", classes: ["class_wizard"] },
      { id: "spell_healing_word", classes: ["class_cleric"] },
    ] as any);

    const result = useSpellcasting();

    expect(result.diagnostics.selections.invalidKnownSpellIds).toEqual([
      "spell_magic_missile",
      "spell_healing_word",
    ]);
    expect(result.diagnostics.selections.invalidPreparedSpellIds).toEqual([
      "spell_healing_word",
    ]);
    expect(result.pools.prepared.max).toBe(7);
  });
});

describe("useSpellcasting race spellcasting", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCharacterStore).mockReturnValue({
      level: 3,
      raceId: "race_test",
      subraceId: null,
      classId: null,
      subclassId: null,
      classTracks: [],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(useCharacterStats).mockReturnValue({
      abilities: {
        scores: { str: 10, dex: 10, con: 10, int: 14, wis: 10, cha: 10 },
        modifiers: { str: 0, dex: 0, con: 0, int: 2, wis: 0, cha: 0 },
      },
      combat: {
        proficiencyBonus: 2,
        hp: { max: 8, current: 8 },
        initiative: 0,
        armorClass: 10,
        isArmorPenalized: false,
        speed: 30,
      },
      encumbrance: { totalWeight: 0, carryingCapacity: 150, isEncumbered: false },
    } as any);

    vi.mocked(getClassById).mockReturnValue(null);
    vi.mocked(getSubclassById).mockReturnValue(null);
    vi.mocked(getAllSpells).mockReturnValue([] as any);
    vi.mocked(getSpellByID).mockReturnValue(null);
    vi.mocked(getAllCharacterTraits).mockReturnValue([] as any);
    vi.mocked(getSubraceById).mockReturnValue(null);
  });

  it("resolves cantrips from a race trait with a spellcasting definition", () => {
    vi.mocked(getRaceById).mockReturnValue({
      id: "race_test",
      traits: ["trait_race_spellcasting"],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        id: "trait_race_spellcasting",
        spellcasting: {
          ability: "int",
          preparationType: "known",
          ritualCasting: false,
          progressionByLevel: [
            { level: 1, cantripsKnown: 2 },
            { level: 3, cantripsKnown: 3 },
          ],
        },
      },
    ] as any);

    const result = useSpellcasting();

    expect(result.pools.cantrips.max).toBe(3);
    expect(result.casting.ability).toBe("int");
    expect(result.isSpellcaster).toBe(true);
  });

  it("race spellcasting does not inflate multiclass caster level", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      level: 3,
      raceId: "race_test",
      subraceId: null,
      classId: "class_wizard",
      subclassId: null,
      classTracks: [{ classId: "class_wizard", subclassId: null, level: 3 }],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getRaceById).mockReturnValue({
      id: "race_test",
      traits: ["trait_race_spellcasting"],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      progression: [{ level: 3, features: ["trait_wiz_spellcasting"] }],
    } as any);

    vi.mocked(getTraitsByIds).mockImplementation((ids) => {
      const results: any[] = [];
      if (ids.includes("trait_wiz_spellcasting")) {
        results.push({
          id: "trait_wiz_spellcasting",
          spellcasting: {
            ability: "int",
            preparationType: "prepared",
            ritualCasting: true,
            progressionByLevel: [
              { level: 3, cantripsKnown: 2, spellSlots: { 1: 4, 2: 2 } },
            ],
          },
        });
      }
      if (ids.includes("trait_race_spellcasting")) {
        results.push({
          id: "trait_race_spellcasting",
          spellcasting: {
            ability: "cha",
            preparationType: "known",
            ritualCasting: false,
            progressionByLevel: [
              { level: 1, cantripsKnown: 1 },
            ],
          },
        });
      }
      return results;
    });

    const result = useSpellcasting();

    // wizard level 3 = full caster level 3 → slots: 1×4, 2×2
    // race trait contributes 0 to caster level
    expect(result.slots.shared).toEqual({
      1: { total: 4, expended: 0 },
      2: { total: 2, expended: 0 },
    });
    // cantrips stack: 2 from wizard + 1 from race
    expect(result.pools.cantrips.max).toBe(3);
  });

  it("merges spellcasting from subrace trait alongside race trait", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      level: 2,
      raceId: "race_test",
      subraceId: "subrace_test",
      classId: null,
      subclassId: null,
      classTracks: [],
      choicesByLevel: {},
      acquiredFeats: [],
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getRaceById).mockReturnValue({
      id: "race_test",
      traits: [],
    } as any);

    vi.mocked(getSubraceById).mockReturnValue({
      id: "subrace_test",
      traitsAdded: ["trait_subrace_spellcasting"],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        id: "trait_subrace_spellcasting",
        spellcasting: {
          ability: "cha",
          preparationType: "known",
          ritualCasting: false,
          progressionByLevel: [
            { level: 1, cantripsKnown: 1, spellsKnown: 1 },
            { level: 3, cantripsKnown: 1, spellsKnown: 2 },
          ],
        },
      },
    ] as any);

    const result = useSpellcasting();

    expect(result.pools.cantrips.max).toBe(1);
    expect(result.pools.known.max).toBe(1);
    expect(result.casting.ability).toBe("cha");
  });
});

describe("useSpellcasting spell list expansion/restrictions", () => {
  const baseStoreState = {
    raceId: null,
    subraceId: null,
    choicesByLevel: {},
    acquiredFeats: [],
    expendedSpellSlots: {},
    expendedPactSlots: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCharacterStats).mockReturnValue({
      abilities: {
        scores: { str: 10, dex: 10, con: 10, int: 16, wis: 10, cha: 10 },
        modifiers: { str: 0, dex: 0, con: 0, int: 3, wis: 0, cha: 0 },
      },
      combat: {
        proficiencyBonus: 3,
        hp: { max: 30, current: 30 },
        initiative: 0,
        armorClass: 14,
        isArmorPenalized: false,
        speed: 30,
      },
      encumbrance: { totalWeight: 0, carryingCapacity: 150, isEncumbered: false },
    } as any);
    vi.mocked(getRaceById).mockReturnValue(null);
    vi.mocked(getSubraceById).mockReturnValue(null);
    vi.mocked(getAllSpells).mockReturnValue([] as any);
    vi.mocked(getSpellByID).mockReturnValue(null);
    vi.mocked(getAllCharacterTraits).mockReturnValue([] as any);
  });

  it("populates bonusPrepared from active progression entries", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 5,
      classId: "class_paladin",
      subclassId: "subclass_devotion",
      classTracks: [{ classId: "class_paladin", subclassId: "subclass_devotion", level: 5 }],
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      progression: [{ level: 5, features: ["trait_paladin_spellcasting"] }],
    } as any);
    vi.mocked(getSubclassById).mockReturnValue({
      progression: [{ level: 3, features: ["trait_devotion_sacred_weapons"] }],
    } as any);
    vi.mocked(getTraitsByIds).mockImplementation((ids) => {
      const results: any[] = [];
      if (ids.includes("trait_paladin_spellcasting")) {
        results.push({
          id: "trait_paladin_spellcasting",
          spellcasting: {
            ability: "cha",
            preparationType: "prepared",
            ritualCasting: false,
            progressionByLevel: [{ level: 5, cantripsKnown: 0, spellSlots: { 1: 4, 2: 2 } }],
          },
        });
      }
      if (ids.includes("trait_devotion_sacred_weapons")) {
        results.push({
          id: "trait_devotion_sacred_weapons",
          spellcasting: {
            ability: "cha",
            preparationType: "prepared",
            ritualCasting: false,
            progressionByLevel: [
              { level: 3, bonusSpells: ["spell_protection_from_evil"] },
              { level: 5, bonusSpells: ["spell_protection_from_evil", "spell_zone_of_truth"] },
            ],
          },
        });
      }
      return results;
    });

    const result = useSpellcasting();

    expect(result.pools.bonusPrepared).toContain("spell_protection_from_evil");
    expect(result.pools.bonusPrepared).toContain("spell_zone_of_truth");
    expect(result.pools.bonusPrepared).toHaveLength(2);
  });

  it("bonusPrepared spells are not counted against prepared overflow", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 5,
      classId: "class_paladin",
      subclassId: "subclass_devotion",
      classTracks: [{ classId: "class_paladin", subclassId: "subclass_devotion", level: 5 }],
      spellsPrepared: ["spell_protection_from_evil", "spell_zone_of_truth"],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      progression: [{ level: 5, features: ["trait_paladin_spellcasting"] }],
    } as any);
    vi.mocked(getSubclassById).mockReturnValue({
      progression: [{ level: 3, features: ["trait_devotion_sacred_weapons"] }],
    } as any);
    vi.mocked(getTraitsByIds).mockImplementation((ids) => {
      const results: any[] = [];
      if (ids.includes("trait_paladin_spellcasting")) {
        results.push({
          id: "trait_paladin_spellcasting",
          spellcasting: {
            ability: "cha",
            preparationType: "prepared",
            ritualCasting: false,
            progressionByLevel: [{ level: 5, cantripsKnown: 0, spellSlots: { 1: 4, 2: 2 } }],
          },
        });
      }
      if (ids.includes("trait_devotion_sacred_weapons")) {
        results.push({
          id: "trait_devotion_sacred_weapons",
          spellcasting: {
            ability: "cha",
            preparationType: "prepared",
            ritualCasting: false,
            progressionByLevel: [
              { level: 3, bonusSpells: ["spell_protection_from_evil"] },
              { level: 5, bonusSpells: ["spell_protection_from_evil", "spell_zone_of_truth"] },
            ],
          },
        });
      }
      return results;
    });
    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_protection_from_evil", classes: ["class_paladin"], school: "abjuration" },
      { id: "spell_zone_of_truth", classes: ["class_paladin"], school: "enchantment" },
    ] as any);

    const result = useSpellcasting();

    expect(result.diagnostics.selections.preparedSpellOverflow).toBe(0);
    expect(result.diagnostics.selections.invalidPreparedSpellIds).toEqual([]);
  });

  it("spellsAddedToList makes a spell eligible for a prepared track", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 5,
      classId: "class_paladin",
      subclassId: "subclass_devotion",
      classTracks: [{ classId: "class_paladin", subclassId: "subclass_devotion", level: 5 }],
      spellsPrepared: ["spell_crown_of_madness"],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      progression: [{ level: 5, features: ["trait_paladin_spellcasting"] }],
    } as any);
    vi.mocked(getSubclassById).mockReturnValue({
      progression: [{ level: 3, features: ["trait_devotion_expanded"] }],
    } as any);
    vi.mocked(getTraitsByIds).mockImplementation((ids) => {
      const results: any[] = [];
      if (ids.includes("trait_paladin_spellcasting")) {
        results.push({
          id: "trait_paladin_spellcasting",
          spellcasting: {
            ability: "cha",
            preparationType: "prepared",
            ritualCasting: false,
            progressionByLevel: [{ level: 5, cantripsKnown: 0, spellSlots: { 1: 4, 2: 2 } }],
          },
        });
      }
      if (ids.includes("trait_devotion_expanded")) {
        results.push({
          id: "trait_devotion_expanded",
          spellcasting: {
            ability: "cha",
            preparationType: "prepared",
            ritualCasting: false,
            progressionByLevel: [
              { level: 3, spellsAddedToList: ["spell_crown_of_madness"] },
            ],
          },
        });
      }
      return results;
    });
    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_crown_of_madness", classes: ["class_wizard"], school: "enchantment" },
    ] as any);

    const result = useSpellcasting();

    expect(result.diagnostics.selections.invalidPreparedSpellIds).toEqual([]);
  });

  it("flags a known spell of wrong school for a restricted known track", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 7,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [{ classId: "class_fighter", subclassId: "subclass_eldritch_knight", level: 7 }],
      spellsPrepared: [],
      spellsKnown: ["spell_charm_person"],
    } as any);

    vi.mocked(getClassById).mockReturnValue({ progression: [] } as any);
    vi.mocked(getSubclassById).mockReturnValue({
      progression: [{ level: 3, features: ["trait_ek_spellcasting"] }],
    } as any);
    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        id: "trait_ek_spellcasting",
        spellcasting: {
          ability: "int",
          preparationType: "known",
          ritualCasting: false,
          schoolRestrictions: ["abjuration", "evocation"],
          spellListSource: ["class_wizard"],
          progressionByLevel: [
            { level: 3, cantripsKnown: 2, spellsKnown: 3, spellSlots: { 1: 2 } },
            { level: 7, cantripsKnown: 2, spellsKnown: 6, spellSlots: { 1: 4, 2: 2 } },
          ],
        },
      },
    ] as any);
    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_charm_person", classes: ["class_wizard"], school: "enchantment" },
    ] as any);

    const result = useSpellcasting();

    // enchantment is not in schoolRestrictions → invalid even though it's on the wizard list
    expect(result.diagnostics.selections.invalidKnownSpellIds).toContain("spell_charm_person");
  });

  it("EK can select wizard abjuration/evocation spells via spellListSource + schoolRestrictions", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 7,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [{ classId: "class_fighter", subclassId: "subclass_eldritch_knight", level: 7 }],
      spellsPrepared: [],
      spellsKnown: ["spell_shield", "spell_absorb_elements"],
    } as any);

    vi.mocked(getClassById).mockReturnValue({ progression: [] } as any);
    vi.mocked(getSubclassById).mockReturnValue({
      progression: [{ level: 3, features: ["trait_ek_spellcasting"] }],
    } as any);
    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        id: "trait_ek_spellcasting",
        spellcasting: {
          ability: "int",
          preparationType: "known",
          ritualCasting: false,
          schoolRestrictions: ["abjuration", "evocation"],
          spellListSource: ["class_wizard"],
          progressionByLevel: [
            { level: 7, cantripsKnown: 2, spellsKnown: 6, spellSlots: { 1: 4, 2: 2 } },
          ],
        },
      },
    ] as any);
    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_shield", classes: ["class_wizard"], school: "abjuration" },
      { id: "spell_absorb_elements", classes: ["class_wizard"], school: "abjuration" },
    ] as any);

    const result = useSpellcasting();

    // wizard abjuration — valid for EK (spellListSource: wizard, schoolRestrictions: abjuration/evocation)
    expect(result.diagnostics.selections.invalidKnownSpellIds).toEqual([]);
  });

  it("spell valid for an unrestricted track is not flagged when a restricted track also exists", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 9,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [
        { classId: "class_fighter", subclassId: "subclass_eldritch_knight", level: 6 },
        { classId: "class_wizard", subclassId: null, level: 3 },
      ],
      spellsPrepared: [],
      spellsKnown: ["spell_charm_person"],
    } as any);

    vi.mocked(getClassById).mockImplementation((id) => {
      if (id === "class_fighter") return { progression: [] } as any;
      if (id === "class_wizard") {
        return { progression: [{ level: 3, features: ["trait_wiz_spellcasting"] }] } as any;
      }
      return null;
    });
    vi.mocked(getSubclassById).mockReturnValue({
      progression: [{ level: 3, features: ["trait_ek_spellcasting"] }],
    } as any);
    vi.mocked(getTraitsByIds).mockImplementation((ids) => {
      const results: any[] = [];
      if (ids.includes("trait_ek_spellcasting")) {
        results.push({
          id: "trait_ek_spellcasting",
          spellcasting: {
            ability: "int",
            preparationType: "known",
            ritualCasting: false,
            schoolRestrictions: ["abjuration", "evocation"],
            spellListSource: ["class_wizard"],
            progressionByLevel: [
              { level: 3, cantripsKnown: 2, spellsKnown: 3, spellSlots: { 1: 2 } },
              { level: 6, cantripsKnown: 2, spellsKnown: 6, spellSlots: { 1: 4, 2: 2 } },
            ],
          },
        });
      }
      if (ids.includes("trait_wiz_spellcasting")) {
        results.push({
          id: "trait_wiz_spellcasting",
          spellcasting: {
            ability: "int",
            preparationType: "known",
            ritualCasting: true,
            progressionByLevel: [
              { level: 3, cantripsKnown: 3, spellsKnown: 6, spellSlots: { 1: 4, 2: 2 } },
            ],
          },
        });
      }
      return results;
    });
    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_charm_person", classes: ["class_wizard"], school: "enchantment" },
    ] as any);

    const result = useSpellcasting();

    // charm person is invalid for EK (enchantment), but valid for the unrestricted wizard track
    expect(result.diagnostics.selections.invalidKnownSpellIds).toEqual([]);
  });
});

describe("useSpellcasting free-school designation", () => {
  const baseStoreState = {
    raceId: null,
    subraceId: null,
    choicesByLevel: {},
    acquiredFeats: [],
    expendedSpellSlots: {},
    expendedPactSlots: 0,
    spellsPrepared: [],
  };

  const ekTraitBase = {
    id: "trait_ek_spellcasting",
    spellcasting: {
      ability: "int",
      preparationType: "known",
      ritualCasting: false,
      schoolRestrictions: ["abjuration", "evocation"],
      spellListSource: ["class_wizard"],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCharacterStats).mockReturnValue({
      abilities: {
        scores: { str: 10, dex: 10, con: 10, int: 16, wis: 10, cha: 10 },
        modifiers: { str: 0, dex: 0, con: 0, int: 3, wis: 0, cha: 0 },
      },
      combat: {
        proficiencyBonus: 3,
        hp: { max: 30, current: 30 },
        initiative: 0,
        armorClass: 14,
        isArmorPenalized: false,
        speed: 30,
      },
      encumbrance: { totalWeight: 0, carryingCapacity: 150, isEncumbered: false },
    } as any);
    vi.mocked(getRaceById).mockReturnValue(null);
    vi.mocked(getSubraceById).mockReturnValue(null);
    vi.mocked(getAllSpells).mockReturnValue([] as any);
    vi.mocked(getSpellByID).mockReturnValue(null);
    vi.mocked(getAllCharacterTraits).mockReturnValue([] as any);
    vi.mocked(getClassById).mockReturnValue({ progression: [] } as any);
    vi.mocked(getSubclassById).mockReturnValue({
      progression: [{ level: 3, features: ["trait_ek_spellcasting"] }],
    } as any);
  });

  it("resolves freeSchoolSpellSlots from progression: EK level 9 → 1 slot, level 15 → 2 slots", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 9,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [{ classId: "class_fighter", subclassId: "subclass_eldritch_knight", level: 9 }],
      spellsKnown: [],
      freeSchoolKnownSpellIds: [],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        ...ekTraitBase,
        spellcasting: {
          ...ekTraitBase.spellcasting,
          progressionByLevel: [
            { level: 3, cantripsKnown: 2, spellsKnown: 3, spellSlots: { 1: 2 } },
            { level: 8, cantripsKnown: 2, spellsKnown: 6, freeSchoolSpellSlots: 1, spellSlots: { 1: 4, 2: 2 } },
            { level: 9, cantripsKnown: 2, spellsKnown: 6, spellSlots: { 1: 4, 2: 2 } },
          ],
        },
      },
    ] as any);

    const result9 = useSpellcasting();
    expect(result9.pools.freeSchoolSlots).toBe(1);

    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 15,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [{ classId: "class_fighter", subclassId: "subclass_eldritch_knight", level: 15 }],
      spellsKnown: [],
      freeSchoolKnownSpellIds: [],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        ...ekTraitBase,
        spellcasting: {
          ...ekTraitBase.spellcasting,
          progressionByLevel: [
            { level: 8, cantripsKnown: 2, spellsKnown: 6, freeSchoolSpellSlots: 1, spellSlots: { 1: 4, 2: 2 } },
            { level: 14, cantripsKnown: 3, spellsKnown: 10, freeSchoolSpellSlots: 2, spellSlots: { 1: 4, 2: 3, 3: 2 } },
            { level: 15, cantripsKnown: 3, spellsKnown: 10, spellSlots: { 1: 4, 2: 3, 3: 2 } },
          ],
        },
      },
    ] as any);

    const result15 = useSpellcasting();
    expect(result15.pools.freeSchoolSlots).toBe(2);
  });

  it("designated free-school wizard spell bypasses EK school restriction", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 9,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [{ classId: "class_fighter", subclassId: "subclass_eldritch_knight", level: 9 }],
      spellsKnown: ["spell_charm_person"],
      freeSchoolKnownSpellIds: ["spell_charm_person"],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        ...ekTraitBase,
        spellcasting: {
          ...ekTraitBase.spellcasting,
          progressionByLevel: [
            { level: 8, cantripsKnown: 2, spellsKnown: 6, freeSchoolSpellSlots: 1, spellSlots: { 1: 4, 2: 2 } },
            { level: 9, cantripsKnown: 2, spellsKnown: 6, spellSlots: { 1: 4, 2: 2 } },
          ],
        },
      },
    ] as any);

    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_charm_person", classes: ["class_wizard"], school: "enchantment" },
    ] as any);

    const result = useSpellcasting();

    // charm person is enchantment (restricted), but it's designated as a free-school pick
    expect(result.diagnostics.selections.invalidKnownSpellIds).toEqual([]);
  });

  it("spell in freeSchoolKnownSpellIds but NOT on spellListSource remains invalid", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 9,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [{ classId: "class_fighter", subclassId: "subclass_eldritch_knight", level: 9 }],
      spellsKnown: ["spell_healing_word"],
      freeSchoolKnownSpellIds: ["spell_healing_word"],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        ...ekTraitBase,
        spellcasting: {
          ...ekTraitBase.spellcasting,
          progressionByLevel: [
            { level: 8, cantripsKnown: 2, spellsKnown: 6, freeSchoolSpellSlots: 1, spellSlots: { 1: 4, 2: 2 } },
            { level: 9, cantripsKnown: 2, spellsKnown: 6, spellSlots: { 1: 4, 2: 2 } },
          ],
        },
      },
    ] as any);

    vi.mocked(getAllSpells).mockReturnValue([
      // healing word is cleric-only, not on wizard list
      { id: "spell_healing_word", classes: ["class_cleric"], school: "evocation" },
    ] as any);

    const result = useSpellcasting();

    // Designated but not on spellListSource → still invalid
    expect(result.diagnostics.selections.invalidKnownSpellIds).toContain("spell_healing_word");
  });

  it("freeSchoolOverflow = 2 when 3 designations exist but only 1 slot available", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...baseStoreState,
      level: 9,
      classId: "class_fighter",
      subclassId: "subclass_eldritch_knight",
      classTracks: [{ classId: "class_fighter", subclassId: "subclass_eldritch_knight", level: 9 }],
      spellsKnown: ["spell_a", "spell_b", "spell_c"],
      freeSchoolKnownSpellIds: ["spell_a", "spell_b", "spell_c"],
    } as any);

    vi.mocked(getTraitsByIds).mockReturnValue([
      {
        ...ekTraitBase,
        spellcasting: {
          ...ekTraitBase.spellcasting,
          progressionByLevel: [
            { level: 8, cantripsKnown: 2, spellsKnown: 6, freeSchoolSpellSlots: 1, spellSlots: { 1: 4, 2: 2 } },
            { level: 9, cantripsKnown: 2, spellsKnown: 6, spellSlots: { 1: 4, 2: 2 } },
          ],
        },
      },
    ] as any);

    const result = useSpellcasting();

    expect(result.pools.freeSchoolSlots).toBe(1);
    expect(result.diagnostics.selections.freeSchoolOverflow).toBe(2);
  });
});
