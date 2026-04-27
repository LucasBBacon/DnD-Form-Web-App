import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import { SKILL_ABILITY_MAP } from "./constants";
import { getAllCharacterTraits } from "./traitUtils";

/**
 * Describes a single skill-pick prompt granted by a trait at a specific level.
 *
 * The source fields identify the trait that granted the choice so the UI can
 * render stable groups and preserve per-source selections.
 */
export interface PendingSkillChoice {
  sourceId: string;
  sourceName: string;
  count: number;
  pool: Skill[];
}

/**
 * Aggregated skill-related selections chosen across all completed levels.
 *
 * `skillChoices` contains proficiency grants, while `expertiseChoices`
 * contains upgrades that double proficiency on already proficient skills.
 */
export interface SelectedSkillChoices {
  skillChoices: Skill[];
  expertiseChoices: Skill[];
}

/**
 * Aggregated non-skill proficiencies chosen across all completed levels.
 *
 * These values are stored separately from trait-driven proficiencies because
 * they come from explicit player choices such as feats or class features.
 */
export interface SelectedProficiencyChoices {
  weaponChoices: string[];
  toolChoices: string[];
  languageChoices: string[];
}

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

  for (let level = 1; level <= currentLevel; level++) {
    const choice = choicesByLevel[level];

    // Sets preserve the first-seen order while removing duplicates from feats,
    // retries, or overlapping progression data.
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
export const getPendingSkillChoices = (
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

  const pendingChoices: PendingSkillChoice[] = [];

  allTraits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (effect.type === "proficiency_choice" && effect.choice) {
        // Normalize trait data before returning it so the UI never has to know
        // about schema sentinels like `"any"`.
        const resolvedPool = resolveSkillChoicePool(effect.choice.pool);

        pendingChoices.push({
          sourceId: trait.id,
          sourceName: trait.name,
          count: effect.choice.count,
          pool: resolvedPool,
        });
      }
    });
  });

  return pendingChoices;
};
