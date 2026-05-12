/**
 * Board-specific fixture sets.
 * These are derived from character fixtures and represent common board states.
 */

import type {
  CombatFixture,
  DeathSavesFixture,
  SpellcastingFixture,
  EncumbranceFixture,
  CombatActionFixture,
} from "../types/fixtures";

/**
 * Common combat fixture scenarios for testing vitals, actions, and board components.
 */
export const COMBAT_FIXTURES: Record<string, CombatFixture> = {
  healthy: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
    hp: { current: 45, max: 52 },
  },
  bloodied: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
    hp: { current: 12, max: 52 },
  },
  critical: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
    hp: { current: 3, max: 52 },
  },
  atZero: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
    hp: { current: 0, max: 52 },
  },
  atMax: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
    hp: { current: 52, max: 52 },
  },
  armorPenalized: {
    armorClass: 14,
    initiative: 2,
    speed: 20,
    isArmorPenalized: true,
    hp: { current: 35, max: 52 },
  },
};

/**
 * Death saves state fixtures.
 */
export const DEATH_SAVES_FIXTURES: Record<string, DeathSavesFixture> = {
  none: { successes: 0, failures: 0 },
  oneSuccess: { successes: 1, failures: 0 },
  twoSuccesses: { successes: 2, failures: 0 },
  threeSuccesses: { successes: 3, failures: 0 },
  oneFailure: { successes: 0, failures: 1 },
  twoFailures: { successes: 0, failures: 2 },
  threeFailures: { successes: 0, failures: 3 },
  mixed: { successes: 2, failures: 1 },
};

/**
 * Spellcasting state fixtures.
 */
export const SPELLCASTING_FIXTURES: Record<string, SpellcastingFixture> = {
  noSpells: {
    spellSlotsByLevel: {},
    knownSpells: [],
    preparedSpells: [],
  },
  withSpells: {
    spellSlotsByLevel: {
      1: { available: 4, used: 1 },
      2: { available: 3, used: 0 },
      3: { available: 2, used: 1 },
    },
    knownSpells: ["magic_missile", "shield", "fireball"],
    preparedSpells: ["magic_missile", "shield"],
  },
  allSpent: {
    spellSlotsByLevel: {
      1: { available: 4, used: 4 },
      2: { available: 3, used: 3 },
      3: { available: 2, used: 2 },
    },
    knownSpells: ["magic_missile", "shield", "fireball"],
    preparedSpells: ["magic_missile", "shield"],
  },
  pactCaster: {
    spellSlotsByLevel: {},
    pactSlots: { available: 2, used: 1 },
    knownSpells: ["eldritch_blast"],
    preparedSpells: [],
  },
};

/**
 * Encumbrance state fixtures.
 */
export const ENCUMBRANCE_FIXTURES: Record<string, EncumbranceFixture> = {
  light: {
    totalWeight: 30,
    carryingCapacity: 150,
    isEncumbered: false,
  },
  heavy: {
    totalWeight: 140,
    carryingCapacity: 150,
    isEncumbered: false,
  },
  encumbered: {
    totalWeight: 160,
    carryingCapacity: 150,
    isEncumbered: true,
  },
};

/**
 * Combat action fixtures for Actions Board.
 */
export const ACTION_FIXTURES: Record<string, CombatActionFixture[]> = {
  noActions: [],
  withAttacks: [
    {
      entryId: "attack_1",
      name: "Longsword Attack",
      kind: "action",
      actionCost: { name: "Action", current: 1, max: 1 },
    },
  ],
  withBonusActions: [
    {
      entryId: "bonus_1",
      name: "Cunning Action",
      kind: "bonus_action",
      actionCost: { name: "Bonus Action", current: 1, max: 1 },
    },
  ],
  withReactions: [
    {
      entryId: "reaction_1",
      name: "Parry",
      kind: "reaction",
    },
  ],
};
