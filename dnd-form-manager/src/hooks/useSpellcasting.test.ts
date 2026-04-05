/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "./useCharacterStats";
import {
  getAllSpells,
  getClassById,
  getSpellByID,
  getSubclassById,
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
      modifiers: {
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 2,
      },
      proficiencyBonus: 2,
      isArmorPenalized: false,
    } as any);

    vi.mocked(getClassById).mockReturnValue(null);
    vi.mocked(getSubclassById).mockReturnValue(null);
    vi.mocked(getAllSpells).mockReturnValue([] as any);
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

    expect(result.innateSpells).toHaveLength(1);
    expect(result.innateSpells[0].spellId).toBe("spell_mage_hand");
    expect(result.innateSpells[0].spellName).toBe("Mage Hand");
    expect(result.innateSpells[0].isResolvedSpell).toBe(true);
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

    expect(result.innateSpells).toHaveLength(1);
    expect(result.innateSpells[0].spellId).toBe("spell_missing");
    expect(result.innateSpells[0].spellName).toBe(
      "Unknown Spell (spell_missing)",
    );
    expect(result.innateSpells[0].isResolvedSpell).toBe(false);
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
      modifiers: {
        str: 0,
        dex: 0,
        con: 0,
        int: 3,
        wis: 1,
        cha: 0,
      },
      proficiencyBonus: 2,
      isArmorPenalized: false,
    } as any);

    vi.mocked(getAllCharacterTraits).mockReturnValue([] as any);
    vi.mocked(getSpellByID).mockReturnValue(null);
    vi.mocked(getSubclassById).mockReturnValue(null);
    vi.mocked(getAllSpells).mockReturnValue([] as any);
  });

  it("uses the latest class progression at or below current level", () => {
    vi.mocked(getClassById).mockReturnValue({
      spellcastingBase: {
        ability: "int",
        preparationType: "known",
      },
      progression: [
        {
          level: 1,
          features: [],
          spellcastingProgression: {
            cantripsKnown: 2,
            spellsKnown: 3,
          },
        },
        {
          level: 3,
          features: [],
          spellcastingProgression: {
            cantripsKnown: 3,
            spellsKnown: 4,
          },
        },
        {
          level: 5,
          features: [],
          spellcastingProgression: {
            cantripsKnown: 4,
            spellsKnown: 6,
          },
        },
      ],
    } as any);

    const result = useSpellcasting();

    expect(result.maxCantrips).toBe(3);
    expect(result.maxSpellsKnown).toBe(4);
  });

  it("prefers subclass progression when subclass spellcasting override is present", () => {
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
      spellcastingBase: null,
      progression: [
        {
          level: 1,
          features: [],
          spellcastingProgression: {
            cantripsKnown: 99,
            spellsKnown: 99,
          },
        },
      ],
    } as any);

    vi.mocked(getSubclassById).mockReturnValue({
      spellcastingOverride: {
        ability: "int",
        preparationType: "known",
      },
      progression: [
        {
          level: 3,
          features: [],
          spellcastingProgressionAdditions: {
            cantripsKnown: 1,
            spellsKnown: 3,
          },
        },
        {
          level: 6,
          features: [],
          spellcastingProgressionAdditions: {
            cantripsKnown: 2,
            spellsKnown: 4,
          },
        },
      ],
    } as any);

    const result = useSpellcasting();

    expect(result.maxCantrips).toBe(2);
    expect(result.maxSpellsKnown).toBe(4);
    expect(result.spellcastingAbility).toBe("int");
  });

  it("falls back to class progression when subclass exists without spellcasting override", () => {
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
      spellcastingBase: {
        ability: "int",
        preparationType: "prepared",
      },
      progression: [
        {
          level: 1,
          features: [],
          spellcastingProgression: {
            cantripsKnown: 3,
            spellsKnown: 6,
          },
        },
      ],
    } as any);

    vi.mocked(getSubclassById).mockReturnValue({
      spellcastingOverride: null,
      progression: [
        {
          level: 3,
          features: [],
          spellcastingProgressionAdditions: {
            cantripsKnown: 0,
            spellsKnown: 0,
          },
        },
      ],
    } as any);

    const result = useSpellcasting();

    expect(result.maxCantrips).toBe(3);
    expect(result.maxSpellsKnown).toBe(6);
    expect(result.spellcastingAbility).toBe("int");
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
          spellcastingBase: {
            ability: "int",
            preparationType: "prepared",
            ritualCasting: true,
          },
          progression: [
            {
              level: 3,
              features: [],
              spellcastingProgression: {
                cantripsKnown: 3,
                spellSlots: { 1: 4, 2: 2 },
              },
            },
          ],
        } as any;
      }

      if (id === "class_cleric") {
        return {
          spellcastingBase: {
            ability: "wis",
            preparationType: "prepared",
            ritualCasting: true,
          },
          progression: [
            {
              level: 2,
              features: [],
              spellcastingProgression: {
                cantripsKnown: 3,
                spellSlots: { 1: 3 },
              },
            },
          ],
        } as any;
      }

      return null;
    });

    const result = useSpellcasting();

    expect(result.slotStatusByLevel).toEqual({
      1: { total: 4, expended: 1 },
      2: { total: 3, expended: 1 },
      3: { total: 2, expended: 0 },
    });
    expect(result.pactMagicInfo).toBeNull();
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
          spellcastingBase: {
            ability: "cha",
            preparationType: "pact",
            ritualCasting: false,
          },
          progression: [
            {
              level: 3,
              features: [],
              spellcastingProgression: {
                cantripsKnown: 2,
                spellsKnown: 4,
                spellSlots: { 2: 2 },
              },
            },
          ],
        } as any;
      }

      if (id === "class_bard") {
        return {
          spellcastingBase: {
            ability: "cha",
            preparationType: "known",
            ritualCasting: true,
          },
          progression: [
            {
              level: 2,
              features: [],
              spellcastingProgression: {
                cantripsKnown: 2,
                spellsKnown: 5,
                spellSlots: { 1: 3 },
              },
            },
          ],
        } as any;
      }

      return null;
    });

    const result = useSpellcasting();

    expect(result.slotStatusByLevel).toEqual({
      1: { total: 3, expended: 1 },
    });
    expect(result.pactMagicInfo).toEqual({
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
      spellcastingBase: {
        ability: "int",
        preparationType: "prepared",
        ritualCasting: true,
      },
      progression: [
        {
          level: 4,
          features: [],
          spellcastingProgression: {
            cantripsKnown: 3,
            spellsKnown: 0,
            spellSlots: { 1: 4, 2: 3 },
          },
        },
      ],
    } as any);

    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_magic_missile", classes: ["class_wizard"] },
      { id: "spell_healing_word", classes: ["class_cleric"] },
    ] as any);

    const result = useSpellcasting();

    expect(result.spellSelectionDiagnostics.invalidKnownSpellIds).toEqual([
      "spell_magic_missile",
      "spell_healing_word",
    ]);
    expect(result.spellSelectionDiagnostics.invalidPreparedSpellIds).toEqual([
      "spell_healing_word",
    ]);
    expect(result.maxPreparedSpells).toBe(7);
  });
});
