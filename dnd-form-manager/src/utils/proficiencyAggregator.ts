import type { CharacterStatsContext } from "../hooks/useCharacterStats";
import type { useCharacterStore } from "../store/useCharacterStore";
import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { Ability, Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type { TraitData, TraitEffect } from "../types/trait";
import { SKILL_ABILITY_MAP } from "./constants";
import { evaluateAllPredicates } from "./predicateEngine";
import { getClassById } from "../data/staticDataApi";

// #region Public Types

export type CharacterState = ReturnType<typeof useCharacterStore.getState>;
export type DerivedStats = CharacterStatsContext;
export type ProficiencySourceKind = "static" | "choice" | "trait";

export interface ProficiencyGrant<T extends string> {
  value: T;
  source: ProficiencySourceKind;
  sourceId?: string;
  sourceName?: string;
  level?: number;
  effectType?: TraitEffect["type"];
}

export interface AggregatedProficiencies<T extends string> {
  set: Set<T>;
  list: T[];
  grants: ProficiencyGrant<T>[];
  bySource: {
    static: T[];
    choice: T[];
    trait: Array<{
      value: T;
      sourceId: string;
      sourceName: string;
      effectType: TraitEffect["type"];
    }>;
  };
  has: (value: T) => boolean;
}

export interface AggregateProficienciesOptions<T extends string> {
  currentLevel: number;
  state: CharacterState;
  stats: DerivedStats;
  staticValues?: readonly T[];
  choiceValuesByLevel?: Partial<Record<number, readonly T[]>>;
  traits: TraitData[];
  matchEffectTypes: readonly TraitEffect["type"][];
  mapTarget: (target: string) => T | null;
  includeEffect?: (effect: TraitEffect, currentLevel: number) => boolean;
}

export interface AggregateSkillProficienciesOptions {
  chosenRacialSkills: Skill[];
  chosenBackgroundSkills: Skill[];
  choicesByLevel: Record<number, LevelChoice>;
  currentLevel: number;
  traits: TraitData[];
  state: CharacterState;
  stats: DerivedStats;
}

export interface AggregateSaveProficienciesOptions {
  classSavingThrows: readonly Ability[];
  currentLevel: number;
  traits: TraitData[];
  state: CharacterState;
  stats: DerivedStats;
}

export interface AggregateNonSkillProficienciesOptions {
  choicesByLevel: Record<number, LevelChoice>;
  currentLevel: number;
  traits: TraitData[];
  state: CharacterState;
  stats: DerivedStats;
}

export interface AggregateSaveProficienciesMulticlassOptions {
  classTracks: CharacterClassTrack[];
  currentLevel: number;
  traits: TraitData[];
  state: CharacterState;
  stats: DerivedStats;
}

export interface AggregateNonSkillProficienciesMulticlassOptions {
  classTracks: CharacterClassTrack[];
  choicesByLevel: Record<number, LevelChoice>;
  currentLevel: number;
  traits: TraitData[];
  state: CharacterState;
  stats: DerivedStats;
}

// #endregion

// #region Domain Constants

const skillKeys = new Set(Object.keys(SKILL_ABILITY_MAP) as Skill[]);
const abilityKeys = new Set<Ability>([
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
]);
const weaponCategoryAliases: Record<string, string> = {
  simple: "simple",
  martial: "martial",
  weapon_simple: "simple",
  weapon_martial: "martial",
  category_weapon_simple: "simple",
  category_weapon_martial: "martial",
};
const armorCategoryAliases: Record<string, string> = {
  light: "light",
  medium: "medium",
  heavy: "heavy",
  shield: "shield",
  armor_light: "light",
  armor_medium: "medium",
  armor_heavy: "heavy",
  armor_shield: "shield",
  armor_shields: "shield",
  category_armor_light: "light",
  category_armor_light_no_metal: "light",
  category_armor_medium: "medium",
  category_armor_medium_no_metal: "medium",
  category_armor_heavy: "heavy",
  category_armor_heavy_no_metal: "heavy",
  category_armor_shield: "shield",
  category_armor_shield_no_metal: "shield",
  category_armor_shields: "shield",
};
const toolCategoryTargets = new Set([
  "category_artisans_tools",
  "category_musical_instrument",
]);

// #endregion

// #region Domain Guards

/**
 * Determines if a target string belongs to the weapon domain.
 * @param target The target string to check.
 * @returns True if the target is a weapon domain target, false otherwise.
 */
const isWeaponDomainTarget = (target: string): boolean =>
  !!weaponCategoryAliases[target] ||
  target.startsWith("weapon_") ||
  target.startsWith("category_weapon_");
/**
 * Determines if a target string belongs to the armor domain.
 * @param target The target string to check.
 * @returns True if the target is an armor domain target, false otherwise.
 */
const isArmorDomainTarget = (target: string): boolean =>
  !!armorCategoryAliases[target] ||
  target.startsWith("armor_") ||
  target.startsWith("category_armor_");
/**
 * Determines if a target string belongs to the tool domain.
 * @param target The target string to check.
 * @returns True if the target is a tool domain target, false otherwise.
 */
const isToolDomainTarget = (target: string): boolean =>
  toolCategoryTargets.has(target) || target.startsWith("tool_");

/**
 * Determines if a target string is a known skill.
 */
const isKnownSkill = (target: string): target is Skill =>
  skillKeys.has(target as Skill);

// #endregion

// #region Target Normalization

/**
 * Normalizes a weapon target string.
 * @param target The target string to normalize.
 * @returns The normalized weapon target string, or null if it cannot be normalized.
 */
const normalizeWeaponTarget = (target: string): string | null => {
  if (weaponCategoryAliases[target]) return weaponCategoryAliases[target];

  if (target.startsWith("weapon_")) {
    return target;
  }

  if (target.startsWith("category_weapon")) {
    return target;
  }

  if (
    !target.startsWith("armor_") &&
    !target.startsWith("tool_") &&
    !target.startsWith("lang_") &&
    !target.startsWith("category_") &&
    !armorCategoryAliases[target] &&
    !isKnownSkill(target) &&
    !abilityKeys.has(target as Ability)
  ) {
    return `weapon_${target}`;
  }

  return null;
};

/**
 * Normalizes an armor target string.
 * @param target The target string to normalize.
 * @returns The normalized armor target string, or null if it cannot be normalized.
 */
const normalizeArmorTarget = (target: string): string | null => {
  return armorCategoryAliases[target] || null;
};

/**
 * Normalizes a tool target string.
 * @param target The target string to normalize.
 * @returns The normalized tool target string, or null if it cannot be normalized.
 */
const normalizeToolTarget = (target: string): string | null => {
  if (toolCategoryTargets.has(target)) return target;
  if (target.startsWith("tool_")) return target;

  if (
    !target.startsWith("weapon_") &&
    !target.startsWith("armor_") &&
    !target.startsWith("lang_") &&
    !target.startsWith("category_") &&
    (target.endsWith("_tools") ||
      target.endsWith("_supplies") ||
      target.endsWith("_kit"))
  ) {
    return `tool_${target}`;
  }

  return null;
};

/**
 * Normalizes a language or other target string.
 * @param target The target string to normalize.
 * @returns The normalized language or other target string, or null if it cannot be normalized.
 */
const normalizeLanguageOrOtherTarget = (target: string): string | null => {
  if (isKnownSkill(target) || abilityKeys.has(target as Ability)) return null;
  if (
    isWeaponDomainTarget(target) ||
    isArmorDomainTarget(target) ||
    isToolDomainTarget(target)
  ) {
    return null;
  }

  return target;
};

// #endregion

// #region Aggregation Helpers

/**
 * Creates an aggregated proficiencies object from a set of proficiencies, grants, and sources.
 */
const createAggregatedProficiencies = <T extends string>(
  set: Set<T>,
  grants: ProficiencyGrant<T>[],
  bySource: AggregatedProficiencies<T>["bySource"],
): AggregatedProficiencies<T> => ({
  set,
  list: Array.from(set),
  grants,
  bySource,
  has: (value: T) => set.has(value),
});

/**
 * Merges multiple aggregated proficiencies into a single aggregated proficiencies object.
 */
const mergeAggregatedProficiencies = <T extends string>(
  ...results: AggregatedProficiencies<T>[]
): AggregatedProficiencies<T> => {
  const set = new Set<T>();
  const grants: ProficiencyGrant<T>[] = [];
  const bySource: AggregatedProficiencies<T>["bySource"] = {
    static: [],
    choice: [],
    trait: [],
  };

  results.forEach((result) => {
    result.list.forEach((value) => set.add(value));
    grants.push(...result.grants);
    bySource.static.push(...result.bySource.static);
    bySource.choice.push(...result.bySource.choice);
    bySource.trait.push(...result.bySource.trait);
  });

  return createAggregatedProficiencies(set, grants, bySource);
};

/**
 * Determines if a trait effect is active for the given level.
 */
export const isEffectActiveForLevel = (
  effect: TraitEffect,
  currentLevel: number,
): boolean => (effect.levelAvailable || 1) <= currentLevel;

/**
 * Groups choice values by level based on a selector function.
 * @param choicesByLevel The choices organized by level.
 * @param selector A function to select the values from each choice.
 * @returns An object mapping levels to the selected values.
 */
export const groupChoiceValuesByLevel = <T extends string>(
  choicesByLevel: Record<number, LevelChoice>,
  selector: (choice: LevelChoice) => readonly T[] | undefined,
): Partial<Record<number, readonly T[]>> => {
  const grouped: Partial<Record<number, readonly T[]>> = {};

  Object.entries(choicesByLevel).forEach(([levelKey, choice]) => {
    const values = selector(choice);
    if (values && values.length > 0) {
      grouped[Number(levelKey)] = values;
    }
  });

  return grouped;
};

const getNonSkillChoiceBucketsByLevel = (
  choicesByLevel: Record<number, LevelChoice>,
) => {
  const weaponChoicesByLevel = groupChoiceValuesByLevel(choicesByLevel, (choice) =>
    choice.weaponChoices
      ?.map(normalizeWeaponTarget)
      .filter((value): value is string => value !== null),
  );

  const toolChoicesByLevel = groupChoiceValuesByLevel(choicesByLevel, (choice) =>
    choice.toolChoices
      ?.map(normalizeToolTarget)
      .filter((value): value is string => value !== null),
  );

  const languageChoicesByLevel = groupChoiceValuesByLevel(
    choicesByLevel,
    (choice) =>
      choice.languageChoices
        ?.map(normalizeLanguageOrOtherTarget)
        .filter((value): value is string => value !== null),
  );

  return {
    weaponChoicesByLevel,
    toolChoicesByLevel,
    languageChoicesByLevel,
  };
};

// #endregion

// #region Primary Aggregators

/**
 * Aggregates proficiencies from various sources including static values, choices, and traits.
 */
export const aggregateProficiencies = <T extends string>(
  options: AggregateProficienciesOptions<T>,
): AggregatedProficiencies<T> => {
  const set = new Set<T>();
  const grants: ProficiencyGrant<T>[] = [];
  const bySource: AggregatedProficiencies<T>["bySource"] = {
    static: [],
    choice: [],
    trait: [],
  };
  const includeEffect = options.includeEffect || isEffectActiveForLevel;

  options.staticValues?.forEach((value) => {
    set.add(value);
    grants.push({ value, source: "static" });
    bySource.static.push(value);
  });

  for (let level = 1; level <= options.currentLevel; level++) {
    options.choiceValuesByLevel?.[level]?.forEach((value) => {
      set.add(value);
      grants.push({ value, source: "choice", level });
      bySource.choice.push(value);
    });
  }

  options.traits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (!options.matchEffectTypes.includes(effect.type)) return;
      if (!includeEffect(effect, options.currentLevel)) return;

      const isActive = evaluateAllPredicates(
        effect.predicates,
        options.state,
        options.stats,
      );

      if (!isActive || !effect.target) return;

      const mappedTarget = options.mapTarget(effect.target);
      if (!mappedTarget) return;

      set.add(mappedTarget);
      grants.push({
        value: mappedTarget,
        source: "trait",
        sourceId: trait.id,
        sourceName: trait.name,
        effectType: effect.type,
      });
      bySource.trait.push({
        value: mappedTarget,
        sourceId: trait.id,
        sourceName: trait.name,
        effectType: effect.type,
      });
    });
  });

  return createAggregatedProficiencies(set, grants, bySource);
};

/**
 * Aggregates skill proficiencies and expertise from various sources including static values, choices, and traits.
 */
export const aggregateSkillProficiencies = (
  options: AggregateSkillProficienciesOptions,
): {
  proficiencies: AggregatedProficiencies<Skill>;
  expertise: AggregatedProficiencies<Skill>;
} => {
  const skillChoicesByLevel = groupChoiceValuesByLevel(
    options.choicesByLevel,
    (choice) => choice.skillChoices,
  );
  const expertiseChoicesByLevel = groupChoiceValuesByLevel(
    options.choicesByLevel,
    (choice) => choice.expertiseChoices,
  );

  const proficiencies = aggregateProficiencies<Skill>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    staticValues: [
      ...options.chosenRacialSkills,
      ...options.chosenBackgroundSkills,
    ],
    choiceValuesByLevel: skillChoicesByLevel,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: (target) => (isKnownSkill(target) ? target : null),
  });

  const expertise = aggregateProficiencies<Skill>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    choiceValuesByLevel: expertiseChoicesByLevel,
    traits: options.traits,
    matchEffectTypes: ["expertise"],
    mapTarget: (target) => (isKnownSkill(target) ? target : null),
  });

  return { proficiencies, expertise };
};

/**
 * Aggregates saving throw proficiencies from various sources including class features and traits.
 */
export const aggregateSaveProficiencies = (
  options: AggregateSaveProficienciesOptions,
): AggregatedProficiencies<Ability> => {
  return aggregateProficiencies<Ability>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    staticValues: options.classSavingThrows,
    traits: options.traits,
    matchEffectTypes: ["save_proficiency"],
    mapTarget: (target) =>
      abilityKeys.has(target as Ability) ? (target as Ability) : null,
  });
};

/**
 * Aggregates non-skill proficiencies from various sources including choices and traits.
 */
export const aggregateNonSkillProficiencies = (
  options: AggregateNonSkillProficienciesOptions,
): {
  all: AggregatedProficiencies<string>;
  weapons: AggregatedProficiencies<string>;
  armor: AggregatedProficiencies<string>;
  tools: AggregatedProficiencies<string>;
  languagesAndOther: AggregatedProficiencies<string>;
} => {
  const { weaponChoicesByLevel, toolChoicesByLevel, languageChoicesByLevel } =
    getNonSkillChoiceBucketsByLevel(options.choicesByLevel);

  const weapons = aggregateProficiencies<string>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    choiceValuesByLevel: weaponChoicesByLevel,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: normalizeWeaponTarget,
  });

  const armor = aggregateProficiencies<string>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: normalizeArmorTarget,
  });

  const tools = aggregateProficiencies<string>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    choiceValuesByLevel: toolChoicesByLevel,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: normalizeToolTarget,
  });

  const languagesAndOther = aggregateProficiencies<string>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    choiceValuesByLevel: languageChoicesByLevel,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: normalizeLanguageOrOtherTarget,
  });

  return {
    all: mergeAggregatedProficiencies(weapons, armor, tools, languagesAndOther),
    weapons,
    armor,
    tools,
    languagesAndOther,
  };
};

// #endregion

// #region Multiclass Helpers

/**
 * Extracts multiclass proficiencies for a class if joining as a secondary class.
 */
const extractMulticlassProficiencies = (
  classId: string,
  isPrimaryClass: boolean,
): { weapons?: string[]; armor?: string[]; tools?: string[] } => {
  if (isPrimaryClass) return {};

  const classData = getClassById(classId);
  if (!classData?.multiclassProficiencies) return {};

  return {
    weapons: classData.multiclassProficiencies.weapons,
    armor: classData.multiclassProficiencies.armor,
    tools: classData.multiclassProficiencies.tools,
  };
};

/**
 * Collects saving throws from all active class tracks (PHB multiclass rule).
 */
const collectSavingThrowsFromTracks = (
  classTracks: CharacterClassTrack[] | undefined,
): Ability[] => {
  const savingThrows = new Set<Ability>();

  if (!classTracks || classTracks.length === 0) {
    return [];
  }

  classTracks.forEach((track) => {
    const classData = getClassById(track.classId);
    classData?.proficiencies.savingThrows?.forEach((ability: Ability) => {
      savingThrows.add(ability);
    });
  });

  return Array.from(savingThrows);
};

// #endregion

// #region Multiclass Aggregators

/**
 * Aggregates saving throw proficiencies from all active class tracks.
 * In multiclass, a character gains saving throw proficiencies from all classes.
 */
export const aggregateSaveProficienciesMulticlass = (
  options: AggregateSaveProficienciesMulticlassOptions,
): AggregatedProficiencies<Ability> => {
  // Fallback to single-class logic based on primary classId.
  if (!options.classTracks || options.classTracks.length === 0) {
    const primaryClass = options.state.classId;
    const classData = getClassById(primaryClass);
    const savingThrows = classData?.proficiencies.savingThrows || [];

    return aggregateSaveProficiencies({
      classSavingThrows: savingThrows,
      currentLevel: options.currentLevel,
      state: options.state,
      stats: options.stats,
      traits: options.traits,
    });
  }

  const allSavingThrows = collectSavingThrowsFromTracks(options.classTracks);

  return aggregateProficiencies<Ability>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    staticValues: allSavingThrows,
    traits: options.traits,
    matchEffectTypes: ["save_proficiency"],
    mapTarget: (target) =>
      abilityKeys.has(target as Ability) ? (target as Ability) : null,
  });
};

/**
 * Aggregates weapon/armor/tool proficiencies from all active class tracks.
 * When joining a secondary class, the character gains its multiclass_proficiencies.
 * The primary class always grants its starting proficiencies.
 */
export const aggregateNonSkillProficienciesMulticlass = (
  options: AggregateNonSkillProficienciesMulticlassOptions,
): {
  all: AggregatedProficiencies<string>;
  weapons: AggregatedProficiencies<string>;
  armor: AggregatedProficiencies<string>;
  tools: AggregatedProficiencies<string>;
  languagesAndOther: AggregatedProficiencies<string>;
} => {
  // Fallback to single-class logic based on primary classId.
  if (!options.classTracks || options.classTracks.length === 0) {
    return aggregateNonSkillProficiencies({
      choicesByLevel: options.choicesByLevel,
      currentLevel: options.currentLevel,
      state: options.state,
      stats: options.stats,
      traits: options.traits,
    });
  }

  const staticWeapons: string[] = [];
  const staticArmor: string[] = [];
  const staticTools: string[] = [];

  options.classTracks.forEach((track, trackIndex) => {
    const classData = getClassById(track.classId);
    if (!classData) return;

    const isPrimary = trackIndex === 0;
    const mcProfs = extractMulticlassProficiencies(track.classId, isPrimary);

    if (isPrimary) {
      classData.proficiencies.weapons?.forEach((w) => staticWeapons.push(w));
    }

    if (mcProfs.weapons) {
      mcProfs.weapons.forEach((w) => staticWeapons.push(w));
    }
    if (mcProfs.armor) {
      mcProfs.armor.forEach((a) => staticArmor.push(a));
    }
    if (mcProfs.tools) {
      mcProfs.tools.forEach((t) => staticTools.push(t));
    }
  });

  const { weaponChoicesByLevel, toolChoicesByLevel, languageChoicesByLevel } =
    getNonSkillChoiceBucketsByLevel(options.choicesByLevel);

  const weapons = aggregateProficiencies<string>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    staticValues: staticWeapons,
    choiceValuesByLevel: weaponChoicesByLevel,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: normalizeWeaponTarget,
  });

  const armor = aggregateProficiencies<string>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    staticValues: staticArmor,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: normalizeArmorTarget,
  });

  const tools = aggregateProficiencies<string>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    staticValues: staticTools,
    choiceValuesByLevel: toolChoicesByLevel,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: normalizeToolTarget,
  });

  const languagesAndOther = aggregateProficiencies<string>({
    currentLevel: options.currentLevel,
    state: options.state,
    stats: options.stats,
    choiceValuesByLevel: languageChoicesByLevel,
    traits: options.traits,
    matchEffectTypes: ["proficiency"],
    mapTarget: normalizeLanguageOrOtherTarget,
  });

  return {
    all: mergeAggregatedProficiencies(weapons, armor, tools, languagesAndOther),
    weapons,
    armor,
    tools,
    languagesAndOther,
  };
};

// #endregion
