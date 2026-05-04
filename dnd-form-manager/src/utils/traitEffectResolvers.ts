import type { Ability, Size } from "../types/common";
import type { TraitData } from "../types/trait";
import type { ActionData } from "../types/action";
import { getActionsByIds } from "../data/staticDataApi";
import { ABILITIES as ABILITY_KEYS } from "./abilityConstants";

export interface PendingAbilityBonusChoice {
  sourceId: string;
  sourceName: string;
  count: number;
  bonus: number;
  pool: Ability[];
}

const isAbility = (value: string): value is Ability => {
  return (ABILITY_KEYS as string[]).includes(value);
};

const isEffectActiveForLevel = (
  levelAvailable: number | undefined,
  currentLevel: number,
): boolean => {
  return (levelAvailable ?? 1) <= currentLevel;
};

export const resolveFixedAbilityBonusesFromTraits = (
  traits: TraitData[],
  currentLevel: number,
): Partial<Record<Ability, number>> => {
  const bonuses: Partial<Record<Ability, number>> = {};

  traits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (effect.type !== "ability_bonus_fixed") return;
      if (!isEffectActiveForLevel(effect.levelAvailable, currentLevel)) return;
      if (!effect.target || !isAbility(effect.target)) return;
      if (typeof effect.value !== "number") return;

      bonuses[effect.target] = (bonuses[effect.target] ?? 0) + effect.value;
    });
  });

  return bonuses;
};

export const getPendingAbilityBonusChoicesFromTraits = (
  traits: TraitData[],
  currentLevel: number,
): PendingAbilityBonusChoice[] => {
  const pendingChoices: PendingAbilityBonusChoice[] = [];

  traits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (effect.type !== "ability_bonus_choice") return;
      if (!isEffectActiveForLevel(effect.levelAvailable, currentLevel)) return;
      if (!effect.choice || typeof effect.choice.count !== "number") return;

      const bonus =
        typeof effect.choice.bonus === "number"
          ? effect.choice.bonus
          : typeof effect.value === "number"
            ? effect.value
            : 0;

      const poolValues =
        effect.choice.pool === "any" ? ABILITY_KEYS : effect.choice.pool;

      const pool = poolValues.filter((value): value is Ability => isAbility(value));
      if (pool.length === 0) return;

      pendingChoices.push({
        sourceId: trait.id,
        sourceName: trait.name,
        count: effect.choice.count,
        bonus,
        pool,
      });
    });
  });

  return pendingChoices;
};

export const resolveBaseSpeedFromTraits = (
  traits: TraitData[],
  currentLevel: number,
  fallback = 30,
): number => {
  let baseSpeed = fallback;

  traits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (effect.type !== "stat_modifier") return;
      if (!isEffectActiveForLevel(effect.levelAvailable, currentLevel)) return;
      if (effect.target !== "base_speed") return;
      if (typeof effect.value !== "number") return;

      baseSpeed = effect.value;
    });
  });

  return baseSpeed;
};

export const resolveSizeFromTraits = (
  traits: TraitData[],
  currentLevel: number,
  fallback: Size = "medium",
): Size => {
  let size = fallback;

  traits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (effect.type !== "size_set") return;
      if (!isEffectActiveForLevel(effect.levelAvailable, currentLevel)) return;
      if (typeof effect.value !== "string") return;
      if (!["tiny", "small", "medium", "large"].includes(effect.value)) return;

      size = effect.value as Size;
    });
  });

  return size;
};

export const resolveGrantedActionsFromTraits = (
  traits: TraitData[],
  currentLevel: number,
): ActionData[] => {
  const actionIds = new Set<string>();

  traits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (effect.type !== "action_grant") return;
      if (!isEffectActiveForLevel(effect.levelAvailable, currentLevel)) return;
      if (typeof effect.value !== "string") return;

      actionIds.add(effect.value);
    });
  });

  return getActionsByIds(Array.from(actionIds));
};
