/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "./useCharacterStats";
import {
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
  });

  it("resolves innate spell name when spellId exists", () => {
    vi.mocked(getAllCharacterTraits).mockReturnValue([
      {
        id: "trait_test",
        name: "Test Trait",
        lore: { short_description: "test" },
        effects: [
          {
            type: "spell_grant",
            target: "spell_mage_hand",
            level_available: 1,
            spellcasting_ability: "cha",
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
        lore: { short_description: "test" },
        effects: [
          {
            type: "spell_grant",
            target: "spell_missing",
            level_available: 1,
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
  });

  it("uses the latest class progression at or below current level", () => {
    vi.mocked(getClassById).mockReturnValue({
      spellcasting_base: {
        ability: "int",
        preparation_type: "known",
      },
      progression: [
        {
          level: 1,
          features: [],
          spellcasting_progression: {
            cantrips_known: 2,
            spells_known: 3,
          },
        },
        {
          level: 3,
          features: [],
          spellcasting_progression: {
            cantrips_known: 3,
            spells_known: 4,
          },
        },
        {
          level: 5,
          features: [],
          spellcasting_progression: {
            cantrips_known: 4,
            spells_known: 6,
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
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      spellcasting_base: null,
      progression: [
        {
          level: 1,
          features: [],
          spellcasting_progression: {
            cantrips_known: 99,
            spells_known: 99,
          },
        },
      ],
    } as any);

    vi.mocked(getSubclassById).mockReturnValue({
      spellcasting_override: {
        ability: "int",
        preparation_type: "known",
      },
      progression: [
        {
          level: 3,
          features: [],
          spellcasting_progression_additions: {
            cantrips_known: 1,
            spells_known: 3,
          },
        },
        {
          level: 6,
          features: [],
          spellcasting_progression_additions: {
            cantrips_known: 2,
            spells_known: 4,
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
      expendedSpellSlots: {},
      expendedPactSlots: 0,
      spellsPrepared: [],
      spellsKnown: [],
    } as any);

    vi.mocked(getClassById).mockReturnValue({
      spellcasting_base: {
        ability: "int",
        preparation_type: "prepared",
      },
      progression: [
        {
          level: 1,
          features: [],
          spellcasting_progression: {
            cantrips_known: 3,
            spells_known: 6,
          },
        },
      ],
    } as any);

    vi.mocked(getSubclassById).mockReturnValue({
      spellcasting_override: null,
      progression: [
        {
          level: 3,
          features: [],
          spellcasting_progression_additions: {
            cantrips_known: 0,
            spells_known: 0,
          },
        },
      ],
    } as any);

    const result = useSpellcasting();

    expect(result.maxCantrips).toBe(3);
    expect(result.maxSpellsKnown).toBe(6);
    expect(result.spellcastingAbility).toBe("int");
  });
});
