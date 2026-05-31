import type { Ability } from "../../types/common";
import {
  ABILITIES,
  ABILITY_LABELS as ABILITY_NAMES,
} from "../../utils/abilityConstants";
import type { CoreStatsBoardProps } from "./CoreStatsBoard";
import type { AbilityCardSkill } from "./ui/AbilityCard";

// #region Interfaces

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CoreStatsBoardScenario extends CoreStatsBoardProps {}

// #endregion

// #region Helper Functions

/**
 * Helper function to create a skill entry for an ability card, with sensible defaults for optional properties.
 * @param key The unique key for the skill (e.g. "stealth")
 * @param label The display label for the skill (e.g. "Stealth")
 * @param modifier The total modifier for the skill, including ability modifier and proficiency (e.g. 5)
 * @param options Optional overrides for the skill properties, such as proficiency, expertise, advantage, etc.
 * @returns An AbilityCardSkill object with the specified properties and defaults for any unspecified options.
 */
const makeSkill = (
  key: string,
  label: string,
  modifier: number,
  options?: Partial<AbilityCardSkill>,
): AbilityCardSkill => ({
  key,
  label,
  modifier,
  isProficient: false,
  isExpertise: false,
  hasAdvantage: false,
  hasDisadvantage: false,
  tooltip: "",
  ...options,
});

/**
 * Helper function to create a base set of abilities for the CoreStatsBoard, given ability modifiers and scores.
 * This function generates the basic structure for each ability, which can then be further customized with saves and skills.
 * @param modifierByAbility A record mapping each ability to its modifier (e.g. { str: 3, dex: 2, ... })
 * @param scoreByAbility A record mapping each ability to its score (e.g. { str: 16, dex: 14, ... })
 * @returns An array of CoreStatsAbilityEntry objects with the specified modifiers and scores, and default values for saves and skills.
 */
const makeBaseAbilities = (
  modifierByAbility: Record<Ability, number>,
  scoreByAbility: Record<Ability, number>,
): CoreStatsBoardProps["abilities"] =>
  ABILITIES.map((ability) => ({
    key: ability,
    abilityName: ABILITY_NAMES[ability],
    score: scoreByAbility[ability],
    modifier: modifierByAbility[ability],
    save: {
      modifier: modifierByAbility[ability],
      isProficient: false,
    },
    skills: [],
  }));

// #endregion

// #region Fixtures

const balancedAbilities = makeBaseAbilities(
  { str: 3, dex: 2, con: 2, int: 0, wis: 1, cha: -1 },
  { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
).map((entry) => {
  if (entry.key === "str") {
    return {
      ...entry,
      save: { modifier: 6, isProficient: true },
      skills: [
        makeSkill("athletics", "Athletics", 6, {
          isProficient: true,
        }),
      ],
    };
  }
  if (entry.key === "dex") {
    return {
      ...entry,
      skills: [
        makeSkill("acrobatics", "Acrobatics", 2),
        makeSkill("stealth", "Stealth", 4, {
          isProficient: true,
        }),
      ],
    };
  }
  if (entry.key === "wis") {
    return {
      ...entry,
      save: { modifier: 4, isProficient: true },
      skills: [
        makeSkill("perception", "Perception", 4, {
          isProficient: true,
        }),
        makeSkill("insight", "Insight", 1),
      ],
    };
  }
  return entry;
});

const specialistAbilities = makeBaseAbilities(
  { str: -1, dex: 2, con: 1, int: 4, wis: 2, cha: 0 },
  { str: 8, dex: 14, con: 12, int: 18, wis: 14, cha: 10 },
).map((entry) => {
  if (entry.key === "int") {
    return {
      ...entry,
      save: { modifier: 7, isProficient: true },
      skills: [
        makeSkill("arcana", "Arcana", 10, {
          isProficient: true,
          isExpertise: true,
        }),
        makeSkill("history", "History", 7, {
          isProficient: true,
        }),
        makeSkill("investigation", "Investigation", 7, {
          isProficient: true,
        }),
      ],
    };
  }
  if (entry.key === "wis") {
    return {
      ...entry,
      skills: [
        makeSkill("perception", "Perception", 5, {
          isProficient: true,
        }),
        makeSkill("insight", "Insight", 2),
      ],
    };
  }
  return entry;
});

export const CORE_STATS_BOARD_FIXTURES: Record<string, CoreStatsBoardScenario> =
  {
    balanced: {
      proficiencyBonus: 3,
      passives: {
        perception: 14,
        investigation: 10,
        insight: 11,
      },
      abilities: balancedAbilities,
    },
    specialist: {
      proficiencyBonus: 3,
      passives: {
        perception: 15,
        investigation: 17,
        insight: 12,
      },
      abilities: specialistAbilities,
    },
    lowLevel: {
      proficiencyBonus: 2,
      passives: {
        perception: 12,
        investigation: 10,
        insight: 10,
      },
      abilities: makeBaseAbilities(
        { str: 1, dex: 1, con: 2, int: 0, wis: 0, cha: -1 },
        { str: 12, dex: 12, con: 14, int: 10, wis: 10, cha: 8 },
      ),
    },
    pressured: {
      proficiencyBonus: 4,
      passives: {
        perception: 11,
        investigation: 9,
        insight: 10,
      },
      abilities: makeBaseAbilities(
        { str: 4, dex: 1, con: 3, int: -1, wis: 0, cha: -1 },
        { str: 18, dex: 12, con: 16, int: 8, wis: 10, cha: 8 },
      ).map((entry) => {
        if (entry.key === "dex") {
          return {
            ...entry,
            skills: [
              makeSkill("stealth", "Stealth", -1, {
                hasDisadvantage: true,
                tooltip: "Disadvantage: Armor Stealth Disadvantage",
              }),
            ],
          };
        }
        return entry;
      }),
    },
    playground: {
      proficiencyBonus: 3,
      passives: {
        perception: 14,
        investigation: 10,
        insight: 11,
      },
      abilities: balancedAbilities,
    },
  };

// #endregion
