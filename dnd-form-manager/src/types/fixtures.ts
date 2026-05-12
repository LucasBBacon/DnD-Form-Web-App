/**
 * Fixture type definitions for story harnesses and tests.
 * These types define the shape of mock data used across board component stories.
 */

import type { Ability } from "./common";

/**
 * Fixture for character combat stats (armor class, initiative, speed, HP).
 */
export interface CombatFixture {
  armorClass: number;
  initiative: number;
  speed: number;
  isArmorPenalized: boolean;
  hp: {
    current: number;
    max: number;
  };
}

/**
 * Fixture for character death saves state.
 */
export interface DeathSavesFixture {
  successes: number;
  failures: number;
}

/**
 * Fixture for character ability scores and modifiers.
 */
export interface AbilityFixture {
  scores: Record<Ability, number>;
  modifiers: Record<Ability, number>;
}

/**
 * Fixture for spellcasting state (spell slots, known spells, etc.).
 */
export interface SpellcastingFixture {
  spellSlotsByLevel: Record<number, { used: number; available: number }>;
  pactSlots?: { used: number; available: number };
  knownSpells: string[];
  preparedSpells: string[];
}

/**
 * Fixture for encumbrance state.
 */
export interface EncumbranceFixture {
  totalWeight: number;
  carryingCapacity: number;
  isEncumbered: boolean;
}

/**
 * Fixture for a single inventory instance (equipped item).
 */
export interface InventoryInstanceFixture {
  instanceId: string;
  baseItemId: string;
  itemData?: {
    name: string;
    weight?: number;
    rarity?: string;
  };
}

/**
 * Fixture for an inventory stack (multiple copies of an item).
 */
export interface InventoryStackFixture {
  stackId: string;
  baseItemId: string;
  quantity: number;
  itemData?: {
    name: string;
    weight?: number;
  };
}

/**
 * Fixture for a character's roleplay data (traits, biography, etc.).
 */
export interface RoleplayFixture {
  name: string;
  playerName: string;
  backstory: string;
  personality: string;
  ideals: string;
  bonds: string;
  flaws: string;
  traits: Array<{
    name: string;
    shortDescription: string;
    fullDescription: string;
    source: "base" | "race" | "class" | "subclass" | "feat";
  }>;
}

/**
 * Fixture for combat action (attacks, spells, etc.).
 */
export interface CombatActionFixture {
  entryId: string;
  name: string;
  kind: "action" | "bonus_action" | "reaction";
  actionCost?: { name: string; current: number; max: number };
}

/**
 * Full character state fixture combining all pieces.
 */
export interface CharacterFixture {
  name: string;
  playerName: string;
  level: number;
  raceId: string | null;
  classId: string | null;
  subclassId: string | null;
  baseAbilityScores: Record<Ability, number>;
  abilities: AbilityFixture;
  combat: CombatFixture;
  tempHp: number;
  deathSaves: DeathSavesFixture;
  expendedHitDice: number;
  encumbrance: EncumbranceFixture;
  spellcasting: SpellcastingFixture;
  roleplay: RoleplayFixture;
  inventoryInstances: InventoryInstanceFixture[];
  inventoryStacks: InventoryStackFixture[];
}

/**
 * Partial fixture that can be merged onto a base fixture.
 */
export type PartialCharacterFixture = Partial<CharacterFixture>;
