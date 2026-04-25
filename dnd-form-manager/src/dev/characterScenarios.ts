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
import { generateUuidV4 } from "../utils/uuidUtils";

// ── Pre-generate instance IDs for scenarios that equip items ─────────────────

// fighter_l1 (Aldric)
const aldricArmorId = generateUuidV4();
const aldricClubId = generateUuidV4();
const aldricBackpackId = generateUuidV4();

// barbarian_l5 (Grond)
const grondClubId = generateUuidV4();
const grondBackpackId = generateUuidV4();

// wizard_l12 (Elara)
const elaraCrossbowId = generateUuidV4();
const elaraBackpackId = generateUuidV4();

// fighter_rogue_mc (Sable)
const sableArmorId = generateUuidV4();
const sableClub1Id = generateUuidV4();
const sableClub2Id = generateUuidV4();
const sableCrossbowId = generateUuidV4();
const sableBackpackId = generateUuidV4();

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
    inventoryStacks: [
      { stackId: generateUuidV4(), baseItemId: "item_torch", quantity: 10 },
    ],
    inventoryInstances: [
      { instanceId: aldricBackpackId, baseItemId: "item_backpack" },
      { instanceId: aldricArmorId, baseItemId: "item_armor_leather" },
      { instanceId: aldricClubId, baseItemId: "item_weapon_club" },
    ],
    equippedArmorInstanceId: aldricArmorId,
    equippedWeaponInstanceIds: [aldricClubId],
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
    inventoryStacks: [
      { stackId: generateUuidV4(), baseItemId: "item_torch", quantity: 5 },
    ],
    inventoryInstances: [
      { instanceId: grondBackpackId, baseItemId: "item_backpack" },
      { instanceId: grondClubId, baseItemId: "item_weapon_club" },
    ],
    equippedWeaponInstanceIds: [grondClubId],
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
    inventoryStacks: [
      { stackId: generateUuidV4(), baseItemId: "item_torch", quantity: 3 },
      { stackId: generateUuidV4(), baseItemId: "item_ammo_bolt", quantity: 20 },
    ],
    inventoryInstances: [
      { instanceId: elaraBackpackId, baseItemId: "item_backpack" },
      { instanceId: elaraCrossbowId, baseItemId: "item_weapon_crossbow_light" },
    ],
    equippedWeaponInstanceIds: [elaraCrossbowId],
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
    inventoryStacks: [
      { stackId: generateUuidV4(), baseItemId: "item_ammo_bolt", quantity: 30 },
    ],
    inventoryInstances: [
      { instanceId: sableBackpackId, baseItemId: "item_backpack" },
      { instanceId: sableArmorId, baseItemId: "item_armor_leather" },
      { instanceId: sableClub1Id, baseItemId: "item_weapon_club" },
      { instanceId: sableClub2Id, baseItemId: "item_weapon_club" },
      { instanceId: sableCrossbowId, baseItemId: "item_weapon_crossbow_light" },
    ],
    equippedArmorInstanceId: sableArmorId,
    equippedWeaponInstanceIds: [sableClub1Id, sableCrossbowId],
    alignment: "Chaotic Good",
    xp: 34000,
  },

  // ── Warlock 7 pact caster with homebrew test spells ───────────────────────
  warlock_pact_l7: {
    name: "Mirel Nightglass",
    playerName: "Dev",
    raceId: "race_human",
    classId: "class_warlock",
    classTracks: [{ classId: "class_warlock", subclassId: null, level: 7 }],
    level: 7,
    baseAbilityScores: { str: 8, dex: 14, con: 14, int: 12, wis: 10, cha: 18 },
    hpRolls: { 1: 8, 2: 6, 3: 5, 4: 7, 5: 6, 6: 5, 7: 7 },
    choicesByLevel: {
      1: { hpGained: 8 },
      2: { hpGained: 6 },
      3: { hpGained: 5 },
      4: { hpGained: 7 },
      5: { hpGained: 6 },
      6: { hpGained: 5 },
      7: { hpGained: 7 },
    },
    spellsKnown: [
      "spell_ember_spark",
      "spell_hexfire_bolt",
      "spell_void_grasp",
      "spell_ember_veil",
    ],
    spellsPrepared: [],
    expendedPactSlots: 1,
    alignment: "Neutral",
    xp: 23000,
  },

  // ── Warlock 7 pact + innate trait-granted spells via feat ─────────────────
  warlock_pact_innate_l7: {
    name: "Seren Ashwake",
    playerName: "Dev",
    raceId: "race_human",
    classId: "class_warlock",
    classTracks: [{ classId: "class_warlock", subclassId: null, level: 7 }],
    level: 7,
    baseAbilityScores: { str: 8, dex: 14, con: 14, int: 12, wis: 10, cha: 18 },
    hpRolls: { 1: 8, 2: 5, 3: 6, 4: 5, 5: 7, 6: 5, 7: 6 },
    choicesByLevel: {
      1: { hpGained: 8 },
      2: { hpGained: 5 },
      3: { hpGained: 6 },
      4: { hpGained: 5 },
      5: { hpGained: 7 },
      6: { hpGained: 5 },
      7: { hpGained: 6 },
    },
    spellsKnown: [
      "spell_ember_spark",
      "spell_hexfire_bolt",
      "spell_void_grasp",
    ],
    spellsPrepared: [],
    acquiredFeats: [
      {
        featId: "feat_starlit_bloodline",
        source: "level_up",
        sourceLevel: 4,
      },
    ],
    expendedPactSlots: 1,
    alignment: "Chaotic Neutral",
    xp: 23000,
  },

  // ── Wizard 5 / Warlock 4 multiclass with innate trait spells ──────────────
  wizard_warlock_mixed_innate_l9: {
    name: "Iria Starbrand",
    playerName: "Dev",
    raceId: "race_half_elf",
    classId: "class_wizard",
    classTracks: [
      { classId: "class_wizard", subclassId: null, level: 5 },
      { classId: "class_warlock", subclassId: null, level: 4 },
    ],
    level: 9,
    baseAbilityScores: { str: 8, dex: 14, con: 14, int: 18, wis: 12, cha: 16 },
    hpRolls: { 1: 6, 2: 4, 3: 5, 4: 4, 5: 6, 6: 8, 7: 5, 8: 6, 9: 5 },
    choicesByLevel: {
      1: { hpGained: 6 },
      2: { hpGained: 4 },
      3: { hpGained: 5 },
      4: { hpGained: 4 },
      5: { hpGained: 6 },
      6: { hpGained: 8 },
      7: { hpGained: 5 },
      8: { hpGained: 6 },
      9: { hpGained: 5 },
    },
    spellsKnown: ["spell_ember_spark", "spell_hexfire_bolt", "spell_void_grasp"],
    spellsPrepared: [
      "spell_acid_splash",
      "spell_lunar_step",
      "spell_ember_veil",
      "spell_starfall_seal",
    ],
    acquiredFeats: [
      {
        featId: "feat_starlit_bloodline",
        source: "level_up",
        sourceLevel: 4,
      },
    ],
    expendedSpellSlots: { 1: 2, 2: 1 },
    expendedPactSlots: 1,
    alignment: "Neutral Good",
    xp: 48000,
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
