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
