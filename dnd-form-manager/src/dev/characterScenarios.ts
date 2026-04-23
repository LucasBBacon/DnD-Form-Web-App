/**
 * Dev-only scenario catalog for layout testing.
 *
 * Usage (dev server only):
 *   http://localhost:5173/?scenario=fighter_l1
 *   http://localhost:5173/?scenario=barbarian_l5
 *   http://localhost:5173/?scenario=wizard_l12
 *   http://localhost:5173/?scenario=fighter_rogue_mc
 *   http://localhost:5173/?scenario=near_death
 *
 * Each entry is a partial CharacterState override merged on top of
 * BASELINE_CHARACTER_STATE, so you only need to specify the interesting fields.
 */

import type { CharacterState } from "../store/useCharacterStore";
import { BASELINE_CHARACTER_STATE } from "../store/useCharacterStore";

// Partial overrides keyed by scenario name.
const SCENARIO_OVERRIDES: Record<string, Partial<CharacterState>> = {
  // ── Blank character with setup flagged complete ────────────────────────────
  blank: {
    isSetupComplete: true,
    name: "Test Character",
    playerName: "Dev",
  },

  // ── Level 1 Fighter — basic starting character ────────────────────────────
  fighter_l1: {
    name: "Aldric Steele",
    playerName: "Dev",
    raceId: "race_human",
    classId: "class_fighter",
    classTracks: [{ classId: "class_fighter", subclassId: null, level: 1 }],
    level: 1,
    baseAbilityScores: { str: 16, dex: 13, con: 15, int: 10, wis: 12, cha: 8 },
    hpRolls: { 1: 10 },
    choicesByLevel: { 1: { hpGained: 10 } },
    inventory: [
      { itemId: "item_backpack", quantity: 1 },
      { itemId: "item_torch", quantity: 10 },
      { itemId: "item_armor_leather", quantity: 1 },
      { itemId: "item_weapon_club", quantity: 1 },
    ],
    equippedArmorId: "item_armor_leather",
    equippedWeaponIds: ["item_weapon_club"],
    alignment: "Neutral Good",
    xp: 0,
  },

  // ── Level 5 Barbarian — subclass, some HP taken, rage/features in play ────
  barbarian_l5: {
    name: "Grond Half-Orc",
    playerName: "Dev",
    raceId: "race_half_orc",
    classId: "class_barbarian",
    subclassId: "subclass_barbarian_berserker",
    classTracks: [
      {
        classId: "class_barbarian",
        subclassId: "subclass_barbarian_berserker",
        level: 5,
      },
    ],
    level: 5,
    baseAbilityScores: { str: 18, dex: 14, con: 17, int: 8, wis: 11, cha: 9 },
    hpRolls: { 1: 12, 2: 7, 3: 9, 4: 8, 5: 10 },
    choicesByLevel: {
      1: { hpGained: 12 },
      2: { hpGained: 7 },
      3: { hpGained: 9 },
      4: { hpGained: 8 },
      5: { hpGained: 10 },
    },
    inventory: [
      { itemId: "item_backpack", quantity: 1 },
      { itemId: "item_torch", quantity: 5 },
      { itemId: "item_weapon_club", quantity: 1 },
    ],
    equippedWeaponIds: ["item_weapon_club"],
    damageTaken: 14,
    alignment: "Chaotic Neutral",
    xp: 6500,
  },

  // ── Level 12 Wizard — many spells known/prepared, spell slots partially used
  wizard_l12: {
    name: "Elara Moonwhisper",
    playerName: "Dev",
    raceId: "race_elf",
    classId: "class_wizard",
    classTracks: [{ classId: "class_wizard", subclassId: null, level: 12 }],
    level: 12,
    baseAbilityScores: { str: 8, dex: 14, con: 14, int: 20, wis: 13, cha: 10 },
    hpRolls: {
      1: 6, 2: 5, 3: 4, 4: 6, 5: 3, 6: 5,
      7: 6, 8: 4, 9: 5, 10: 4, 11: 6, 12: 5,
    },
    choicesByLevel: Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [
        i + 1,
        { hpGained: [6, 5, 4, 6, 3, 5, 6, 4, 5, 4, 6, 5][i] },
      ]),
    ),
    spellsKnown: ["spell_acid_splash"],
    spellsPrepared: ["spell_acid_splash"],
    expendedSpellSlots: { 1: 3, 2: 2, 3: 1 },
    inventory: [
      { itemId: "item_backpack", quantity: 1 },
      { itemId: "item_torch", quantity: 3 },
      { itemId: "item_ammo_bolt", quantity: 20 },
      { itemId: "item_weapon_crossbow_light", quantity: 1 },
    ],
    equippedWeaponIds: ["item_weapon_crossbow_light"],
    alignment: "Neutral",
    xp: 64000,
  },

  // ── Fighter 5 / Rogue 3 multiclass — exercises multi-track class display ──
  fighter_rogue_mc: {
    name: "Sable Dawnblade",
    playerName: "Dev",
    raceId: "race_half_elf",
    classId: "class_fighter",
    subclassId: null,
    classTracks: [
      { classId: "class_fighter", subclassId: null, level: 5 },
      { classId: "class_rogue", subclassId: null, level: 3 },
    ],
    level: 8,
    baseAbilityScores: { str: 14, dex: 18, con: 14, int: 12, wis: 10, cha: 14 },
    hpRolls: { 1: 10, 2: 8, 3: 7, 4: 9, 5: 8, 6: 6, 7: 7, 8: 8 },
    choicesByLevel: Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [
        i + 1,
        { hpGained: [10, 8, 7, 9, 8, 6, 7, 8][i] },
      ]),
    ),
    inventory: [
      { itemId: "item_backpack", quantity: 1 },
      { itemId: "item_armor_leather", quantity: 1 },
      { itemId: "item_weapon_club", quantity: 2 },
      { itemId: "item_ammo_bolt", quantity: 30 },
      { itemId: "item_weapon_crossbow_light", quantity: 1 },
    ],
    equippedArmorId: "item_armor_leather",
    equippedWeaponIds: ["item_weapon_club", "item_weapon_crossbow_light"],
    alignment: "Chaotic Good",
    xp: 34000,
  },

  // ── Near-death state — stress-tests the vitals / death-save layout ────────
  near_death: {
    name: "Dying Hero",
    playerName: "Dev",
    raceId: "race_human",
    classId: "class_fighter",
    classTracks: [{ classId: "class_fighter", subclassId: null, level: 3 }],
    level: 3,
    baseAbilityScores: { str: 14, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
    hpRolls: { 1: 10, 2: 8, 3: 7 },
    choicesByLevel: {
      1: { hpGained: 10 },
      2: { hpGained: 8 },
      3: { hpGained: 7 },
    },
    damageTaken: 31, // effectively 0 HP on a d10 class with 12 CON
    tempHp: 0,
    deathSaves: { successes: 1, failures: 2 },
    expendedHitDice: 2,
    inventory: [{ itemId: "item_backpack", quantity: 1 }],
    alignment: "Lawful Good",
    xp: 900,
  },
};

/**
 * Returns a complete CharacterState for the given scenario name, or null if the
 * name is not recognised.
 */
export function buildScenarioState(
  name: string,
): CharacterState | null {
  const overrides = SCENARIO_OVERRIDES[name];
  if (!overrides) {
    return null;
  }
  return { ...BASELINE_CHARACTER_STATE, ...overrides, isSetupComplete: true };
}

/** Names of all available layout-test scenarios. */
export const SCENARIO_NAMES = Object.keys(SCENARIO_OVERRIDES) as Array<
  keyof typeof SCENARIO_OVERRIDES
>;
