/**
 * Mock hook utilities for tests and stories.
 * Generates mock objects compatible with real hooks from fixture data.
 */

import type { UseCharacterStatsReturn } from "../hooks/useCharacterStats";
import type { Ability } from "../types/common";
import type {
  CombatFixture,
  DeathSavesFixture,
  AbilityFixture,
  SpellcastingFixture,
  EncumbranceFixture,
} from "../types/fixtures";

/**
 * Creates a mock useCharacterStats return value from fixture data.
 */
export const createMockCharacterStats = (
  combatFixture: CombatFixture,
  abilities: AbilityFixture = {
    scores: { str: 16, dex: 13, con: 15, int: 10, wis: 12, cha: 8 },
    modifiers: { str: 3, dex: 1, con: 2, int: 0, wis: 1, cha: -1 },
  },
  encumbrance: EncumbranceFixture = {
    totalWeight: 30,
    carryingCapacity: 150,
    isEncumbered: false,
  }
): UseCharacterStatsReturn => {
  return {
    abilities: {
      scores: abilities.scores,
      modifiers: abilities.modifiers,
    },
    combat: {
      proficiencyBonus: 3,
      hp: combatFixture.hp,
      initiative: combatFixture.initiative,
      armorClass: combatFixture.armorClass,
      isArmorPenalized: combatFixture.isArmorPenalized,
      armorStealthDisadvantage: combatFixture.isArmorPenalized,
      speed: combatFixture.speed,
    },
    encumbrance,
  };
};

/**
 * Creates a mock useCharacterStore return value for VitalsDashboard.
 */
export const createMockCharacterStoreForVitals = (
  level: number = 5,
  tempHp: number = 0,
  deathSaves: DeathSavesFixture = { successes: 0, failures: 0 },
  expendedHitDice: number = 0,
  callbacks?: {
    takeDamage?: (amount: number) => void;
    heal?: (amount: number) => void;
    setTempHp?: (amount: number) => void;
    recordDeathSave?: (type: "success" | "failure", checked: boolean) => void;
    openRestModal?: (type: "short" | "long") => void;
  }
) => {
  return {
    level,
    tempHp,
    deathSaves,
    expendedHitDice,
    takeDamage: callbacks?.takeDamage ?? (() => {}),
    heal: callbacks?.heal ?? (() => {}),
    setTempHp: callbacks?.setTempHp ?? (() => {}),
    recordDeathSave: callbacks?.recordDeathSave ?? (() => {}),
    openRestModal: callbacks?.openRestModal ?? (() => {}),
  };
};

/**
 * Creates a mock useCharacterStore return value for ActionsBoard.
 */
export const createMockCharacterStoreForActions = (callbacks?: {
  expendTraitActionUse?: (traitId: string, actionId: string) => void;
  restoreTraitActionUse?: (traitId: string, actionId: string) => void;
}) => {
  return {
    expendTraitActionUse: callbacks?.expendTraitActionUse ?? (() => {}),
    restoreTraitActionUse: callbacks?.restoreTraitActionUse ?? (() => {}),
  };
};

/**
 * Creates a mock for useCombatActions hook return value.
 */
export const createMockCombatActions = (overrides?: {
  spellcasting?: SpellcastingFixture;
  sections?: Record<string, unknown>;
  toRomanNumeral?: (num: number) => string;
}) => {
  return {
    spellcasting: overrides?.spellcasting ?? {
      spellSlotsByLevel: {},
      knownSpells: [],
      preparedSpells: [],
    },
    sections: overrides?.sections ?? {},
    toRomanNumeral:
      overrides?.toRomanNumeral ?? ((num: number) => String(num)),
  };
};

/**
 * Creates a mock for useSkills hook return value.
 */
export const createMockSkills = (overrides?: {
  calculatedSkills?: Record<string, unknown>;
  calculatedSaves?: Record<Ability, unknown>;
  proficiencyBonus?: number;
  passives?: Record<string, number>;
}) => {
  return {
    calculatedSkills: overrides?.calculatedSkills ?? {},
    calculatedSaves: overrides?.calculatedSaves ?? {
      str: { total: 3, isProficient: false },
      dex: { total: 1, isProficient: false },
      con: { total: 2, isProficient: false },
      int: { total: 0, isProficient: false },
      wis: { total: 1, isProficient: false },
      cha: { total: -1, isProficient: false },
    },
    proficiencyBonus: overrides?.proficiencyBonus ?? 3,
    passives: overrides?.passives ?? { perception: 11, insight: 11 },
  };
};

/**
 * Creates a mock for useSpellcasting hook return value.
 */
export const createMockSpellcasting = (overrides?: {
  spellSlotsByLevel?: Record<number, { available: number; used: number }>;
  spellSlotsPact?: { available: number; used: number };
  knownSpells?: string[];
  preparedSpells?: string[];
  cantrips?: string[];
}) => {
  return {
    spellSlotsByLevel: overrides?.spellSlotsByLevel ?? {},
    spellSlotsPact: overrides?.spellSlotsPact,
    knownSpells: overrides?.knownSpells ?? [],
    preparedSpells: overrides?.preparedSpells ?? [],
    cantrips: overrides?.cantrips ?? [],
  };
};
