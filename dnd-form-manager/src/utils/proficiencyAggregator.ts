import type { useCharacterStats } from "../hooks/useCharacterStats";
import type { useCharacterStore } from "../store/useCharacterStore";
import type { Ability, Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type { TraitData, TraitEffect } from "../types/trait";
import { SKILL_ABILITY_MAP } from "./constants";
import { evaluateAllPredicates } from "./predicateEngine";

export type CharacterState = ReturnType<typeof useCharacterStore.getState>;
export type DerivedStats = ReturnType<typeof useCharacterStats>;
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
const isWeaponDomainTarget = (target: string): boolean =>
  !!weaponCategoryAliases[target] ||
  target.startsWith("weapon_") ||
  target.startsWith("category_weapon_");
const isArmorDomainTarget = (target: string): boolean =>
  !!armorCategoryAliases[target] ||
  target.startsWith("armor_") ||
  target.startsWith("category_armor_");
const isToolDomainTarget = (target: string): boolean =>
  toolCategoryTargets.has(target) || target.startsWith("tool_");

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

const isKnownSkill = (target: string): target is Skill =>
  skillKeys.has(target as Skill);

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

const normalizeArmorTarget = (target: string): string | null => {
  return armorCategoryAliases[target] || null;
};

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

export const isEffectActiveForLevel = (
  effect: TraitEffect,
  currentLevel: number,
): boolean => (effect.levelAvailable || 1) <= currentLevel;

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

export const aggregateNonSkillProficiencies = (
  options: AggregateNonSkillProficienciesOptions,
): {
  all: AggregatedProficiencies<string>;
  weapons: AggregatedProficiencies<string>;
  armor: AggregatedProficiencies<string>;
  tools: AggregatedProficiencies<string>;
  languagesAndOther: AggregatedProficiencies<string>;
} => {
  const weaponChoicesByLevel = groupChoiceValuesByLevel(
    options.choicesByLevel,
    (choice) =>
      choice.weaponChoices
        ?.map(normalizeWeaponTarget)
        .filter((value): value is string => value !== null),
  );
  const toolChoicesByLevel = groupChoiceValuesByLevel(
    options.choicesByLevel,
    (choice) =>
      choice.toolChoices
        ?.map(normalizeToolTarget)
        .filter((value): value is string => value !== null),
  );
  const languageChoicesByLevel = groupChoiceValuesByLevel(
    options.choicesByLevel,
    (choice) =>
      choice.languageChoices
        ?.map(normalizeLanguageOrOtherTarget)
        .filter((value): value is string => value !== null),
  );

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
