/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "./useCharacterStats";
import { aggregateSkills } from "../utils/skillUtils";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { useSkills } from "./useSkills";

vi.mock("../data/staticDataApi");
vi.mock("../store/useCharacterStore");
vi.mock("../utils/skillUtils");
vi.mock("../utils/traitUtils");
vi.mock("./useCharacterStats");

describe("useSkills", () => {
  const baseState = {
    level: 14,
    raceId: null,
    subraceId: null,
    classId: "class_monk",
    subclassId: null,
    chosenRacialSkills: [],
    chosenBackgroundSkills: [],
    choicesByLevel: {},
    classTracks: [],
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCharacterStore).mockReturnValue(baseState);
    vi.mocked(useCharacterStats).mockReturnValue({
      abilities: {
        scores: {
          str: 14,
          dex: 16,
          con: 12,
          int: 10,
          wis: 18,
          cha: 8,
        },
        modifiers: {
          str: 2,
          dex: 3,
          con: 1,
          int: 0,
          wis: 4,
          cha: -1,
        },
      },
      combat: {
        proficiencyBonus: 5,
        hp: { max: 10, current: 10 },
        initiative: 3,
        armorClass: 15,
        isArmorPenalized: false,
        speed: 30,
      },
      encumbrance: {
        totalWeight: 0,
        carryingCapacity: 210,
        isEncumbered: false,
      },
    } as any);
    vi.mocked(aggregateSkills).mockReturnValue({
      proficiencies: [],
      expertise: [],
    });
  });

  it("keeps base class save proficiencies when no feature grant is present", () => {
    vi.mocked(getAllCharacterTraits).mockReturnValue([
      {
        id: "class_monk_saving_throws",
        name: "Monk Saving Throws",
        effects: [
          { type: "proficiency", category: "saving_throws", item: "str" },
          { type: "proficiency", category: "saving_throws", item: "dex" },
        ],
      },
    ] as any);

    const result = useSkills();

    expect(result.calculatedSaves.str).toEqual({
      total: 7,
      isProficient: true,
    });
    expect(result.calculatedSaves.dex).toEqual({
      total: 8,
      isProficient: true,
    });
    expect(result.calculatedSaves.con).toEqual({
      total: 1,
      isProficient: false,
    });
    expect(result.calculatedSaves.wis).toEqual({
      total: 4,
      isProficient: false,
    });
  });

  it("applies Diamond Soul save proficiencies at monk level 14", () => {
    vi.mocked(getAllCharacterTraits).mockReturnValue([
      {
        id: "class_monk_saving_throws",
        name: "Monk Saving Throws",
        effects: [
          { type: "proficiency", category: "saving_throws", item: "str" },
          { type: "proficiency", category: "saving_throws", item: "dex" },
        ],
      },
      {
        id: "trait_diamond_soul",
        name: "Diamond Soul",
        lore: { shortDescription: "All saves." },
        effects: [
          {
            type: "proficiency",
            category: "saving_throws",
            item: "str",
          },
          {
            type: "proficiency",
            category: "saving_throws",
            item: "dex",
          },
          {
            type: "proficiency",
            category: "saving_throws",
            item: "con",
          },
          {
            type: "proficiency",
            category: "saving_throws",
            item: "int",
          },
          {
            type: "proficiency",
            category: "saving_throws",
            item: "wis",
          },
          {
            type: "proficiency",
            category: "saving_throws",
            item: "cha",
          },
        ],
      },
    ] as any);

    const result = useSkills();

    expect(result.calculatedSaves.str).toEqual({
      total: 7,
      isProficient: true,
    });
    expect(result.calculatedSaves.dex).toEqual({
      total: 8,
      isProficient: true,
    });
    expect(result.calculatedSaves.con).toEqual({
      total: 6,
      isProficient: true,
    });
    expect(result.calculatedSaves.int).toEqual({
      total: 5,
      isProficient: true,
    });
    expect(result.calculatedSaves.wis).toEqual({
      total: 9,
      isProficient: true,
    });
    expect(result.calculatedSaves.cha).toEqual({
      total: 4,
      isProficient: true,
    });
  });
});
