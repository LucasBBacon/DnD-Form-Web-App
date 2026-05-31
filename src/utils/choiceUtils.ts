import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type { ProficiencyCategory } from "../types/trait";
import { getAllSpells } from "../data/staticDataApi";
import { SKILL_ABILITY_MAP } from "./constants";
import { getAllCharacterTraits } from "./traitUtils";

// #region --- Types and Interfaces ---

/**
 * A pending proficiency choice that the player must resolve at level-up.
 *
 * The UI should prompt the player to make selections from the `pool` according
 * to the `count`, and then save the results back to the store keyed by
 * `sourceId` and `category` so they can be applied to the character.
 */
export type ProficiencyChoiceCategory = Extract<
  ProficiencyCategory,
  "skills" | "weapons" | "tools" | "languages"
>;

/**
 * A pending feature choice that the player must resolve at level-up.
 *
 * Similar to `PendingProficiencyChoice`, but for arbitrary trait features rather than proficiencies.
 */
export interface PendingSkillChoice {
  /** The ID of the trait that granted this skill choice. (e.g., "trait_dwarf_prof_skills") */
  sourceId: string;
  /** The name of the trait that granted this skill choice. */
  sourceName: string;
  /** The number of skills that can be selected from the pool. */
  count: number;
  /** The pool of skills available for selection. */
  pool: Skill[];
}

/**
 * Aggregated skill and proficiency choices that have been selected across all levels up to the current one.
 *
 * Determines the character's current proficiencies and skill selections when evaluating new choices at level-up.
 */
export interface PendingProficiencyChoice {
  /** The ID of the trait that granted this proficiency choice. (e.g., "trait_dwarf_prof_weapons") */
  sourceId: string;
  /** The name of the trait that granted this proficiency choice. */
  sourceName: string;
  /** The category of the proficiency choice (e.g., "skills", "weapons"). */
  category: ProficiencyChoiceCategory;
  /** The number of proficiencies that can be selected from the pool. */
  count: number;
  /** The pool of proficiencies available for selection. */
  pool: string[];
}

/**
 * A resolved feature choice that the player has made at level-up.
 *
 * This is the output of the level-up planner after the player has made their selections, ready to be applied to the character.
 */
export interface PendingFeatureChoice {
  /** The ID of the trait that granted this feature choice. (e.g., "trait_dwarf_feat_spellcasting") */
  sourceId: string;
  /** The name of the trait that granted this feature choice. */
  sourceName: string;
  /** The type of effect this feature choice has. */
  effectType: string;
  /** The number of features that can be selected from the pool. */
  count: number;
  /** The pool of features available for selection. */
  pool: string[];
  /** Whether the player is allowed to enter a custom value instead of selecting from the pool. */
  allowCustomValue: boolean;
}

/**
 * Aggregated skill-related selections chosen across all completed levels.
 *
 * `skillChoices` contains proficiency grants, while `expertiseChoices`
 * contains upgrades that double proficiency on already proficient skills.
 */
export interface SelectedSkillChoices {
  /** The skills that have been selected by the player. */
  skillChoices: Skill[];
  /** The skills that have been selected for expertise by the player. */
  expertiseChoices: Skill[];
}

/**
 * Aggregated non-skill proficiencies chosen across all completed levels.
 *
 * These values are stored separately from trait-driven proficiencies because
 * they come from explicit player choices such as feats or class features.
 */
export interface SelectedProficiencyChoices {
  /** The weapons that have been selected by the player. */
  weaponChoices: string[];
  /** The tools that have been selected by the player. */
  toolChoices: string[];
  /** The languages that have been selected by the player. */
  languageChoices: string[];
}

// #endregion

// #region --- Utility Functions ---

/**
 * Resolves a skill-choice pool into a concrete list of selectable skills.
 *
 * Some trait data uses the `"any"` sentinel instead of enumerating every skill.
 * This helper normalizes that shape so downstream UI and validation code can
 * always operate on a plain array.
 *
 * @param pool The raw pool from trait data.
 * @returns A concrete list of skills that may be selected.
 */
export const resolveSkillChoicePool = (
  pool: readonly string[] | "any",
): Skill[] => {
  if (pool === "any") {
    return Object.keys(SKILL_ABILITY_MAP) as Skill[];
  }

  return pool.filter((value): value is Skill => value in SKILL_ABILITY_MAP);
};

const PROFICIENCY_CHOICE_CATEGORIES = new Set<ProficiencyChoiceCategory>([
  "skills",
  "weapons",
  "tools",
  "languages",
]);

/**
 * Checks if a given string is a valid proficiency choice category.
 * @param category The string to check.
 * @returns True if the string is a valid proficiency choice category, false otherwise.
 */
const isProficiencyChoiceCategory = (
  category: string,
): category is ProficiencyChoiceCategory =>
  PROFICIENCY_CHOICE_CATEGORIES.has(category as ProficiencyChoiceCategory);

// #region --- Resolve Spell List ---

const SPELL_LIST_SENTINEL_SUFFIX = "_spell_list";

/**
 * Resolves a spell list sentinel value into the corresponding list of spell IDs.
 *
 * Some trait data uses a sentinel string like `"wizard_spell_list"` to indicate that the choice pool should be all spells available to a class. 
 * This helper detects that pattern and expands it into the actual spell IDs so downstream code can treat it uniformly. 
 * 
 * (TODO: eventually migrate trait data to use explicit arrays and remove this layer of indirection.)
 * @param value The sentinel string or a regular spell ID.
 * @returns An array of spell IDs corresponding to the sentinel or the original spell ID.
 */
const resolveSpellListSentinel = (value: string): string[] => {
  if (!value.endsWith(SPELL_LIST_SENTINEL_SUFFIX)) {
    return [value];
  }

  const classToken = value.slice(0, -SPELL_LIST_SENTINEL_SUFFIX.length);
  const classCandidates = [classToken, `class_${classToken}`];

  return getAllSpells()
    .filter((spell) =>
      spell.classes.some((spellClassId) =>
        classCandidates.includes(spellClassId),
      ),
    )
    .map((spell) => spell.id);
};

/**
 * Resolves a feature-choice pool into concrete values for a trait feature selection.
 * @param pool The raw pool from trait data, which may be a list of strings or the "any" sentinel.
 * @returns A concrete list of selectable options for the feature choice, with sentinels resolved.
 */
const resolveFeatureChoicePool = (
  pool: readonly string[] | "any",
): string[] => {
  // The "any" sentinel is used for some non-proficiency choices to indicate freeform player input rather than a fixed pool. 
  // Return an empty array to signal that there are no predefined options.
  if (pool === "any") {
    return [];
  }

  return Array.from(
    new Set(
      pool.flatMap((entry) =>
        typeof entry === "string" && entry.trim().length > 0
          ? resolveSpellListSentinel(entry)
          : [],
      ),
    ),
  );
};

// #endregion

/**
 * Resolves a proficiency-choice pool into concrete values for a category.
 *
 * This function checks that all pending proficiency and feature choices have been resolved according to their specified counts and pools.
 * @param category The proficiency choice category to resolve.
 * @param pool The raw pool from trait data, which may be a list of strings or the "any" sentinel.
 * @returns A concrete list of selectable options for the proficiency choice, with sentinels resolved.
 */
export const resolveProficiencyChoicePool = (
  category: ProficiencyChoiceCategory,
  pool: readonly string[] | "any",
): string[] => {
  if (category === "skills") {
    return resolveSkillChoicePool(pool);
  }

  if (pool === "any") {
    return [];
  }

  return pool.filter(
    (value) => typeof value === "string" && value.trim() !== "",
  );
};

/**
 * Collects all saved skill and expertise choices up to a target level.
 *
 * The store keeps level choices partitioned by level. This helper flattens the
 * relevant levels into de-duplicated arrays so consumers do not need to repeat
 * the same scan-and-aggregate loop.
 *
 * @param choicesByLevel Saved level choice data keyed by level number.
 * @param currentLevel The highest level whose saved choices should be included.
 * @returns Aggregated skill proficiency and expertise selections.
 */
export const getSelectedSkillChoices = (
  choicesByLevel: Record<number, LevelChoice>,
  currentLevel: number,
): SelectedSkillChoices => {
  const skillChoices = new Set<Skill>();
  const expertiseChoices = new Set<Skill>();

  // Loop through each level up to the current one and aggregate skill and expertise choices, 
  // Sets avoid duplicates while preserving order
  for (let level = 1; level <= currentLevel; level++) {
    const choice = choicesByLevel[level];

    // Sets preserve the first-seen order while removing duplicates from feats,
    // retries, or overlapping progression data
    choice?.skillChoices?.forEach((skill) => skillChoices.add(skill));
    choice?.expertiseChoices?.forEach((skill) => expertiseChoices.add(skill));
  }

  return {
    skillChoices: Array.from(skillChoices),
    expertiseChoices: Array.from(expertiseChoices),
  };
};

/**
 * Collects all saved non-skill proficiency choices up to a target level.
 *
 * Weapon, tool, and language picks are stored in `choicesByLevel`, but several
 * consumers need the same flattened view. Centralizing the aggregation keeps
 * proficiency displays and attack calculations aligned.
 *
 * @param choicesByLevel Saved level choice data keyed by level number.
 * @param currentLevel The highest level whose saved choices should be included.
 * @returns Aggregated weapon, tool, and language selections.
 */
export const getSelectedProficiencyChoices = (
  choicesByLevel: Record<number, LevelChoice>,
  currentLevel: number,
): SelectedProficiencyChoices => {
  const weaponChoices = new Set<string>();
  const toolChoices = new Set<string>();
  const languageChoices = new Set<string>();

  for (let level = 1; level <= currentLevel; level++) {
    const choice = choicesByLevel[level];

    // These categories stay separate because different consumers care about
    // different slices of the data even though they share the same level scan.
    choice?.weaponChoices?.forEach((weapon) => weaponChoices.add(weapon));
    choice?.toolChoices?.forEach((tool) => toolChoices.add(tool));
    choice?.languageChoices?.forEach((language) =>
      languageChoices.add(language),
    );
  }

  return {
    weaponChoices: Array.from(weaponChoices),
    toolChoices: Array.from(toolChoices),
    languageChoices: Array.from(languageChoices),
  };
};

// #endregion

// #region --- Pending Choices ---

/**
 * Finds skill-choice prompts that become available exactly at a given level.
 *
 * This is used when deciding whether the player must make a new selection at
 * level-up. It intentionally looks only at traits granted on the requested
 * level so the UI does not re-open choices from prior levels.
 *
 * @param level The exact level being evaluated for new choices.
 * @param raceId The selected race identifier, if any.
 * @param subraceId The selected subrace identifier, if any.
 * @param classId The selected class identifier, if any.
 * @param subclassId The selected subclass identifier, if any.
 * @returns Pending skill choice groups for that level.
 */
export const getPendingProficiencyChoices = (
  level: number,
  raceId: string | null,
  subraceId: string | null,
  classId: string | null,
  subclassId: string | null,
  choicesByLevel: Record<number, LevelChoice> = {},
  classTracks: CharacterClassTrack[] = [],
) => {
  // Only get traits granted AT THIS LEVEL to avoid re-prompting old choices.
  const allTraits = getAllCharacterTraits(
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
    true,
    choicesByLevel,
    [],
    classTracks,
  );

  const pendingChoices: PendingProficiencyChoice[] = [];

  allTraits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (
        effect.type === "proficiency_choice" &&
        effect.choice &&
        effect.category &&
        isProficiencyChoiceCategory(effect.category)
      ) {
        // Normalize trait data before returning it so the UI never has to know
        // about schema sentinels like `"any"`.
        const resolvedPool = resolveProficiencyChoicePool(
          effect.category,
          effect.choice.pool,
        );

        pendingChoices.push({
          sourceId: trait.id,
          sourceName: trait.name,
          category: effect.category,
          count: effect.choice.count,
          pool: resolvedPool,
        });
      }
    });
  });

  return pendingChoices;
};

/**
 * Finds feature-choice prompts that become available exactly at a given level.
 * @param level The exact level being evaluated for new choices.
 * @param raceId The selected race identifier, if any.
 * @param subraceId The selected subrace identifier, if any.
 * @param classId The selected class identifier, if any.
 * @param subclassId The selected subclass identifier, if any.
 * @param choicesByLevel The saved level choice data keyed by level number.
 * @param classTracks The character's class progression tracks, if any.
 * @returns Pending feature choice groups for that level.
 */
export const getPendingFeatureChoices = (
  level: number,
  raceId: string | null,
  subraceId: string | null,
  classId: string | null,
  subclassId: string | null,
  choicesByLevel: Record<number, LevelChoice> = {},
  classTracks: CharacterClassTrack[] = [],
): PendingFeatureChoice[] => {
  const allTraits = getAllCharacterTraits(
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
    true,
    choicesByLevel,
    [],
    classTracks,
  );

  const pendingChoices: PendingFeatureChoice[] = [];

  allTraits.forEach((trait) => {
    trait.effects?.forEach((effect, effectIndex) => {
      if (!effect.choice || typeof effect.choice.count !== "number") {
        return;
      }

      if (
        effect.type === "proficiency_choice" ||
        effect.type === "ability_bonus_choice"
      ) {
        return;
      }

      const count = Math.max(1, Math.floor(effect.choice.count));
      const sourceId = `${trait.id}:${effect.type}:${effectIndex}`;

      pendingChoices.push({
        sourceId,
        sourceName: trait.name,
        effectType: effect.type,
        count,
        pool: resolveFeatureChoicePool(effect.choice.pool),
        allowCustomValue: effect.choice.pool === "any",
      });
    });
  });

  return pendingChoices;
};

// #endregion
