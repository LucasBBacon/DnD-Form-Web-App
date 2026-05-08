import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCombatActions } from "./useCombatActions";
import { useAttacks } from "./useAttacks";
import { useSpellcasting } from "./useSpellcasting";
import { useTraitActions } from "./useTraitActions";
import { useCharacterStore } from "../store/useCharacterStore";
import { getSpellByID } from "../data/staticDataApi";
import { getAllCharacterTraits } from "../utils/traitUtils";

vi.mock("./useAttacks");
vi.mock("./useSpellcasting");
vi.mock("./useTraitActions");
vi.mock("../store/useCharacterStore");
vi.mock("../data/staticDataApi");
vi.mock("../utils/traitUtils");

describe("useCombatActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAttacks).mockReturnValue({ attacks: [] } as any);
    vi.mocked(useTraitActions).mockReturnValue({ actions: [] } as any);
    vi.mocked(getAllCharacterTraits).mockReturnValue([] as any);

    vi.mocked(useCharacterStore).mockReturnValue({
      level: 1,
      raceId: null,
      subraceId: null,
      classId: "class_cleric",
      subclassId: "subclass_cleric_war",
      choicesByLevel: {},
      acquiredFeats: [],
      classTracks: [
        {
          classId: "class_cleric",
          subclassId: "subclass_cleric_war",
          level: 1,
        },
      ],
      expendedTraitActionUses: {},
    } as any);

    vi.mocked(useSpellcasting).mockReturnValue({
      pools: {
        known: { selected: [], max: 0 },
        prepared: { selected: ["spell_shield_of_faith"], max: 2 },
        bonusPrepared: ["spell_divine_favor", "spell_shield_of_faith"],
      },
      slots: {
        shared: {
          1: { total: 2, expended: 0 },
        },
        pact: null,
      },
    } as any);

    vi.mocked(getSpellByID).mockImplementation((spellId: string | null) => {
      if (spellId === "spell_divine_favor") {
        return {
          id: "spell_divine_favor",
          name: "Divine Favor",
          actionType: "bonus_action",
          castingTime: "1 bonus action",
          level: 1,
          range: "Self",
          duration: "Up to 1 minute",
          lore: { shortDescription: "Deal extra radiant damage." },
        } as any;
      }

      if (spellId === "spell_shield_of_faith") {
        return {
          id: "spell_shield_of_faith",
          name: "Shield of Faith",
          actionType: "bonus_action",
          castingTime: "1 bonus action",
          level: 1,
          range: "60 feet",
          duration: "Up to 10 minutes",
          lore: { shortDescription: "+2 AC for a target." },
        } as any;
      }

      return null;
    });
  });

  it("includes bonus-prepared spells in castable action pools with dedupe", () => {
    const { result } = renderHook(() => useCombatActions());

    const bonusActions = result.current.sections.bonus_action.filter(
      (entry) => entry.source === "spell",
    );

    expect(bonusActions.map((entry) => entry.name).sort()).toEqual([
      "Divine Favor",
      "Shield of Faith",
    ]);
    expect(
      bonusActions.filter((entry) => entry.name === "Shield of Faith"),
    ).toHaveLength(1);
  });
});
