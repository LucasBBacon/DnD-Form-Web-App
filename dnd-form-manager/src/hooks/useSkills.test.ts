import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "./useCharacterStats";
import { getClassById } from "../data/staticDataApi";
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
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useCharacterStore).mockReturnValue(baseState);
        vi.mocked(useCharacterStats).mockReturnValue({
            modifiers: {
                str: 2,
                dex: 3,
                con: 1,
                int: 0,
                wis: 4,
                cha: -1,
            },
            proficiencyBonus: 5,
            isArmorPenalized: false,
        } as any);
        vi.mocked(getClassById).mockReturnValue({
            proficiencies: { saving_throws: ["str", "dex"] },
        } as any);
        vi.mocked(aggregateSkills).mockReturnValue({
            proficiencies: [],
            expertise: [],
        });
    });

    it("keeps base class save proficiencies when no feature grant is present", () => {
        vi.mocked(getAllCharacterTraits).mockReturnValue([]);

        const result = useSkills();

        expect(result.calculatedSaves.str).toEqual({total: 7, isProficient: true});
        expect(result.calculatedSaves.dex).toEqual({total: 8, isProficient: true});
        expect(result.calculatedSaves.con).toEqual({total: 1, isProficient: false});
        expect(result.calculatedSaves.wis).toEqual({total: 4, isProficient: false});
    });

    it("applies Diamond Soul save proficiencies at monk level 14", () => {
        vi.mocked(getAllCharacterTraits).mockReturnValue([
            {
                id: "trait_diamond_soul",
                name: "Diamond Soul",
                lore: { short_description: "All saves." },
                effects: [
                    {
                        type: "save_proficiency",
                        target: "str"
                    },
                    {
                        type: "save_proficiency",
                        target: "dex"
                    },
                    {
                        type: "save_proficiency",
                        target: "con"
                    },
                    {
                        type: "save_proficiency",
                        target: "int"
                    },
                    {
                        type: "save_proficiency",
                        target: "wis"
                    },
                    {
                        type: "save_proficiency",
                        target: "cha"
                    }
                ]
            }
        ] as any);

        const result = useSkills();

        expect(result.calculatedSaves.str).toEqual({total: 7, isProficient: true});
        expect(result.calculatedSaves.dex).toEqual({total: 8, isProficient: true});
        expect(result.calculatedSaves.con).toEqual({total: 6, isProficient: true});
        expect(result.calculatedSaves.int).toEqual({total: 5, isProficient: true});
        expect(result.calculatedSaves.wis).toEqual({total: 9, isProficient: true});
        expect(result.calculatedSaves.cha).toEqual({total: 4, isProficient: true});
    });
});