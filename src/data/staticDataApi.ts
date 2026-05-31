import type { Race } from "../types/race";
import type { SubraceData } from "../types/subrace";
import type { ClassData } from "../types/class";
import type { SubclassData } from "../types/subclass";
import type { ItemCategoryData, ItemData } from "../types/item";
import type {
  ProseUpcastEffect,
  SpellDamageEntry,
  SpellData,
  SpellHealingEntry,
  SpellRawData,
} from "../types/spell";
import type { FeatData } from "../types/feat";
import type { TraitData } from "../types/trait";
import type { ActionData } from "../types/action";

import rawRacesData from "./races.json";
import rawSubracesData from "./subraces.json";
import rawClassesData from "./classes.json";
import rawSubclassesData from "./subclasses.json";
import rawItemsData from "./items.json";
import rawItemCategoriesData from "./itemCategories.json";
import rawSpellsData from "./spells.json";
import rawFeatsData from "./feats.json";
import rawTraitsData from "./traits.json";
import rawActionsData from "./actions.json";
import { normalizeSpells } from "./spellNormalizer";
import {
  getAllWeaponProperties,
  getWeaponPropertyById,
} from "./weaponNormalizer";

// region Race API
const racesArray = rawRacesData as unknown as Race[];
const raceDictionary: Record<string, Race> = {};
racesArray.forEach((r) => {
  raceDictionary[r.id] = r;
});

export const getRaceById = (id: string | null): Race | null => {
  if (!id) return null;
  return raceDictionary[id] || null;
};

export const getAllRaces = (): Race[] => {
  return racesArray;
};

// region Subrace API
const subracesArray = rawSubracesData as SubraceData[];
const subraceDictionary: Record<string, SubraceData> = {};
subracesArray.forEach((sr) => {
  subraceDictionary[sr.id] = sr;
});

export const getSubraceById = (id: string | null): SubraceData | null => {
  if (!id) return null;
  return subraceDictionary[id] || null;
};

export const getSubracesForRace = (raceId: string): SubraceData[] => {
  // Canonical race->subrace relationship: subrace.parentRaceId matches race.id.
  return subracesArray.filter((sr) => sr.parentRaceId === raceId);
};

// region Class API
const classesArray = rawClassesData as unknown as ClassData[];
const classDictionary: Record<string, ClassData> = {};
classesArray.forEach((c) => {
  classDictionary[c.id] = c;
});

export const getClassById = (id: string | null): ClassData | null => {
  if (!id) return null;
  return classDictionary[id] || null;
};

export const getAllClasses = (): ClassData[] => {
  return classesArray;
};

// region Subclass API
const subclassesArray = rawSubclassesData as unknown as SubclassData[];
const subclassDictionary: Record<string, SubclassData> = {};
subclassesArray.forEach((sc) => {
  subclassDictionary[sc.id] = sc;
});

export const getSubclassById = (id: string | null): SubclassData | null => {
  if (!id) return null;
  return subclassDictionary[id] || null;
};

export const getSubclassesForClass = (classId: string): SubclassData[] => {
  return subclassesArray.filter((sc) => sc.parentClassId === classId);
};

// region Items API
const itemsArray = rawItemsData as ItemData[];
const itemsDictionary: Record<string, ItemData> = {};
itemsArray.forEach((i) => {
  itemsDictionary[i.id] = i;
});

export const getItemById = (id: string | null): ItemData | null => {
  if (!id) return null;
  return itemsDictionary[id] || null;
};

export const getAllItems = (): ItemData[] => {
  return itemsArray;
};

const itemCategoriesArray = rawItemCategoriesData as ItemCategoryData[];
const itemCategoryDictionary: Record<string, ItemCategoryData> = {};
itemCategoriesArray.forEach((category) => {
  itemCategoryDictionary[category.id] = category;
});

export const getItemCategoryById = (
  id: string | null,
): ItemCategoryData | null => {
  if (!id) return null;
  return itemCategoryDictionary[id] || null;
};

export const getAllItemCategories = (): ItemCategoryData[] => {
  return itemCategoriesArray;
};

export const getItemsByCategory = (categoryId: string): ItemData[] => {
  const category = itemCategoryDictionary[categoryId];
  if (!category) {
    return [];
  }

  return category.itemIds
    .map((itemId) => itemsDictionary[itemId])
    .filter((item): item is ItemData => item !== undefined);
};

// region Spells API
const spellsArray = normalizeSpells(rawSpellsData as SpellRawData[]);
const spellsDictionary: Record<string, SpellData> = {};
spellsArray.forEach((s) => {
  spellsDictionary[s.id] = s;
});

export const getSpellByID = (id: string | null): SpellData | null => {
  if (!id) return null;
  return spellsDictionary[id] || null;
};

export const getAllSpells = (): SpellData[] => {
  return spellsArray;
};

export interface SpellSlotPools {
  shared: Record<number, { total: number; expended: number }>;
  pact: { level: number; total: number; expended: number } | null;
}

export interface SpellCastLevelOption {
  level: number;
  canUseSharedSlot: boolean;
  canUsePactSlot: boolean;
  hasAvailableSlot: boolean;
}

const SIMPLE_ROLL_RE =
  /^\s*(\d+)d(4|6|8|10|12|20|100)(?:\s*([+-])\s*(\d+))?\s*$/i;

const parseSimpleRollExpression = (expression: string) => {
  const match = expression.match(SIMPLE_ROLL_RE);
  if (!match) return null;

  const [, countRaw, sidesRaw, signRaw, modifierRaw] = match;
  const count = Number(countRaw);
  const sides = Number(sidesRaw);
  const modifier =
    modifierRaw == null ? 0 : Number(modifierRaw) * (signRaw === "-" ? -1 : 1);

  if (!Number.isInteger(count) || count <= 0) return null;
  if (!Number.isInteger(sides) || sides <= 0) return null;

  return { count, sides, modifier };
};

const formatSimpleRollExpression = (
  count: number,
  sides: number,
  modifier: number,
): string => {
  if (modifier === 0) return `${count}d${sides}`;
  if (modifier > 0) return `${count}d${sides}+${modifier}`;
  return `${count}d${sides}${modifier}`;
};

const resolveBestThresholdExpression = (
  thresholds: Record<string, string>,
  castLevel: number,
): string | null => {
  const best = Object.entries(thresholds)
    .map(([level, expression]) => ({
      level: Number(level),
      expression,
    }))
    .filter((entry) => Number.isFinite(entry.level) && entry.level <= castLevel)
    .sort((a, b) => b.level - a.level)[0];

  return best?.expression ?? null;
};

const addRollExpressions = (
  baseExpression: string,
  incrementExpression: string,
  times: number,
): string | null => {
  if (times <= 0) return baseExpression;

  const base = parseSimpleRollExpression(baseExpression);
  const increment = parseSimpleRollExpression(incrementExpression);
  if (!base || !increment) return null;
  if (base.sides !== increment.sides) return null;

  const totalCount = base.count + increment.count * times;
  const totalModifier = base.modifier + increment.modifier * times;

  return formatSimpleRollExpression(totalCount, base.sides, totalModifier);
};

export const getSpellCastLevelOptions = (
  spell: SpellData,
  slots: SpellSlotPools,
): SpellCastLevelOption[] => {
  if (spell.level === 0) {
    return [
      {
        level: 0,
        canUseSharedSlot: false,
        canUsePactSlot: false,
        hasAvailableSlot: true,
      },
    ];
  }

  const byLevel = new Map<number, SpellCastLevelOption>();

  Object.entries(slots.shared).forEach(([levelKey, data]) => {
    const level = Number(levelKey);
    if (!Number.isInteger(level) || level < spell.level) return;
    const remaining = Math.max(data.total - data.expended, 0);
    if (remaining <= 0) return;

    byLevel.set(level, {
      level,
      canUseSharedSlot: true,
      canUsePactSlot: byLevel.get(level)?.canUsePactSlot ?? false,
      hasAvailableSlot: true,
    });
  });

  if (slots.pact) {
    const pactRemaining = Math.max(slots.pact.total - slots.pact.expended, 0);
    if (pactRemaining > 0 && slots.pact.level >= spell.level) {
      const existing = byLevel.get(slots.pact.level);
      byLevel.set(slots.pact.level, {
        level: slots.pact.level,
        canUseSharedSlot: existing?.canUseSharedSlot ?? false,
        canUsePactSlot: true,
        hasAvailableSlot: true,
      });
    }
  }

  return Array.from(byLevel.values()).sort((a, b) => a.level - b.level);
};

type SpellRollEntry = {
  roll: string;
  slotScaling?: {
    mode: "linear" | "table";
    incrementPerSlotLevel?: string;
    startAtSlotLevel?: number;
    bySlotLevel?: Record<string, string>;
  };
  scaling?: {
    type: "character_level" | "class_level" | "spell_slot";
    thresholds?: Record<string, string>;
  };
};

const resolveSpellRollAtCastLevel = (
  spell: SpellData,
  entry: SpellRollEntry,
  castLevel: number,
): string => {
  if (castLevel <= spell.level) {
    return entry.roll;
  }

  if (entry.slotScaling?.mode === "table" && entry.slotScaling.bySlotLevel) {
    return (
      resolveBestThresholdExpression(
        entry.slotScaling.bySlotLevel,
        castLevel,
      ) ?? entry.roll
    );
  }

  if (
    entry.slotScaling?.mode === "linear" &&
    entry.slotScaling.incrementPerSlotLevel
  ) {
    const startAt = entry.slotScaling.startAtSlotLevel ?? spell.level + 1;
    if (castLevel < startAt) {
      return entry.roll;
    }

    const increments = castLevel - startAt + 1;
    return (
      addRollExpressions(
        entry.roll,
        entry.slotScaling.incrementPerSlotLevel,
        increments,
      ) ?? entry.roll
    );
  }

  if (entry.scaling?.type === "spell_slot" && entry.scaling.thresholds) {
    return (
      resolveBestThresholdExpression(entry.scaling.thresholds, castLevel) ??
      entry.roll
    );
  }

  return entry.roll;
};

export const resolveSpellDamageRollAtCastLevel = (
  spell: SpellData,
  damageEntry: SpellDamageEntry,
  castLevel: number,
): string => {
  return resolveSpellRollAtCastLevel(spell, damageEntry, castLevel);
};

export const getResolvedSpellDamageEntriesAtCastLevel = (
  spell: SpellData,
  castLevel: number,
): SpellDamageEntry[] => {
  const damageEntries = spell.output?.damage ?? [];
  return damageEntries.map((entry) => ({
    ...entry,
    roll: resolveSpellDamageRollAtCastLevel(spell, entry, castLevel),
  }));
};

export const resolveSpellHealingRollAtCastLevel = (
  spell: SpellData,
  healingEntry: SpellHealingEntry,
  castLevel: number,
): string => {
  return resolveSpellRollAtCastLevel(spell, healingEntry, castLevel);
};

export const getResolvedSpellHealingEntriesAtCastLevel = (
  spell: SpellData,
  castLevel: number,
): SpellHealingEntry[] => {
  const healingEntries = spell.output?.healing ?? [];
  return healingEntries.map((entry) => ({
    ...entry,
    roll: resolveSpellHealingRollAtCastLevel(spell, entry, castLevel),
  }));
};

/**
 * Determines which spell slot pools (shared or pact) have available slots at a given level.
 * @param spellLevel The spell level to check
 * @param expendedSlots Record of expended shared spell slots by level
 * @param maxSharedSlots Maximum shared slots available at this level (0 if none)
 * @param expendedPactSlots Number of expended pact slots
 * @param maxPactSlots Maximum pact slots available (typically for Warlocks)
 * @returns Object with available pools and their availability status
 */
export const getAvailablePoolsForLevel = (
  spellLevel: number,
  expendedSlots: Record<number, number>,
  maxSharedSlots: number,
  expendedPactSlots: number,
  maxPactSlots: number,
): { canUseShared: boolean; canUsePact: boolean; availablePools: Array<'shared' | 'pact'> } => {
  const expended = expendedSlots[spellLevel] ?? 0;
  const canUseShared = expended < maxSharedSlots;
  const canUsePact = expendedPactSlots < maxPactSlots && spellLevel <= maxPactSlots; // Pact slots are all same level
  const availablePools: Array<'shared' | 'pact'> = [];
  
  if (canUseShared) availablePools.push('shared');
  if (canUsePact) availablePools.push('pact');
  
  return { canUseShared, canUsePact, availablePools };
};

/**
 * Formats a spell cast confirmation message with spell name, cast level, pool, and remaining slots.
 * @param spellName Name of the spell
 * @param baseLevel Base spell level
 * @param castLevel Selected cast level for this cast
 * @param pool Pool used (shared or pact)
 * @param remainingAtLevel Remaining slots at the cast level after expenditure
 * @returns Formatted confirmation message
 */
export const formatSpellCastConfirmation = (
  spellName: string,
  baseLevel: number,
  castLevel: number,
  pool: 'shared' | 'pact' | null,
  remainingAtLevel: number,
): string => {
  if (baseLevel === 0) {
    // Cantrip: no slot consumed
    return `Cast ${spellName}`;
  }

  const upcastPart = castLevel > baseLevel ? ` at ${ordinalSuffix(castLevel)} level` : '';
  const poolPart = pool === 'pact' ? ' using Pact Slot' : ' using Shared Slot';
  const slotWord = remainingAtLevel === 1 ? 'slot' : 'slots';
  const verbWord = remainingAtLevel === 1 ? 'remains' : 'remain';
  const remainingPart = ` (${remainingAtLevel} ${slotWord} ${verbWord})`;

  return `Cast ${spellName}${upcastPart}${poolPart}${remainingPart}`;
};

/**
 * Helper to convert a number to ordinal string (1 => "1st", 2 => "2nd", etc.)
 */
const ordinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
};

// region Feats API
const featsArray = rawFeatsData as FeatData[];
const featDictionary: Record<string, FeatData> = {};
featsArray.forEach((feat) => {
  featDictionary[feat.id] = feat;
});

export const getFeatById = (id: string | null): FeatData | null => {
  if (!id) return null;
  return featDictionary[id] || null;
};

export const getFeatsByIds = (ids: string[]): FeatData[] => {
  return ids
    .map((id) => featDictionary[id])
    .filter((feat): feat is FeatData => feat !== undefined);
};

export const getAllFeats = (): FeatData[] => {
  return featsArray;
};

export const getFeatsByCategory = (
  category: FeatData["category"],
): FeatData[] => {
  return featsArray.filter((feat) => feat.category === category);
};

// region Traits API
const traitsArray = rawTraitsData as TraitData[];
const traitDictionary: Record<string, TraitData> = {};
traitsArray.forEach((t) => {
  traitDictionary[t.id] = t;
});

export const getTraitById = (id: string): TraitData | null => {
  return traitDictionary[id] || null;
};

export const getTraitsByIds = (ids: string[]): TraitData[] => {
  return ids
    .map((id) => traitDictionary[id])
    .filter((t): t is TraitData => t !== undefined);
};

// region Actions API
const actionsArray = rawActionsData as ActionData[];
const actionDictionary: Record<string, ActionData> = {};
actionsArray.forEach((action) => {
  actionDictionary[action.id] = action;
});

export const getActionById = (id: string | null): ActionData | null => {
  if (!id) return null;
  return actionDictionary[id] || null;
};

export const getActionsByIds = (ids: string[]): ActionData[] => {
  return ids
    .map((id) => actionDictionary[id])
    .filter((action): action is ActionData => action !== undefined);
};

export const getAllActions = (): ActionData[] => {
  return actionsArray;
};

export { getAllWeaponProperties, getWeaponPropertyById };

// Mock getter
// export const getTraitsByIds = (ids: string[]) => {
//   return ids.map(id => ({
//     id,
//     name: id.replace('trait_', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
//     lore: { shortDescription: "Trait description pending static data update." }
//   }));
// }

/**
 * Retrieves prose-style upcast effects for a given spell and level.
 * @param spell The spell object.
 * @param level The cast level.
 * @returns The prose upcast effects for the given level.
 */
export function getProseUpcastEffectsAtLevel(
  spell: SpellData,
  level: number,
): ProseUpcastEffect[] {
  return (
    spell.proseUpcastEffects?.filter((effect) => effect.level <= level) || []
  );
}
