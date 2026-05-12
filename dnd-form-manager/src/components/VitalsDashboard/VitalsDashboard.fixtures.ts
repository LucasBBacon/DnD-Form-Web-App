/**
 * VitalsDashboard-specific fixture overrides.
 * These combine base board fixtures with local state variations
 * (form visibility, rest modal states, etc.).
 */

import {
  COMBAT_FIXTURES,
  DEATH_SAVES_FIXTURES,
} from "../../fixtures/boardFixtures";

/**
 * Local state for VitalsDashboard stories.
 */
export interface VitalsDashboardLocalState {
  healthInput: number | "";
  activeHealthMode: "damage" | "heal" | "temp" | null;
}

/**
 * Complete fixture combination for a story scenario.
 */
export interface VitalsDashboardScenario {
  combat: (typeof COMBAT_FIXTURES)[keyof typeof COMBAT_FIXTURES];
  deathSaves: (typeof DEATH_SAVES_FIXTURES)[keyof typeof DEATH_SAVES_FIXTURES];
  level: number;
  expendedHitDice: number;
  tempHp: number;
  localState: VitalsDashboardLocalState;
}

/**
 * Predefined scenario combinations for VitalsDashboard stories.
 */
export const VITALS_DASHBOARD_FIXTURES: Record<
  string,
  VitalsDashboardScenario
> = {
  healthy: {
    combat: COMBAT_FIXTURES.healthy,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 5,
    expendedHitDice: 0,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: null },
  },
  withTempHp: {
    combat: COMBAT_FIXTURES.healthy,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 5,
    expendedHitDice: 0,
    tempHp: 8,
    localState: { healthInput: "", activeHealthMode: null },
  },
  bloodied: {
    combat: COMBAT_FIXTURES.bloodied,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 5,
    expendedHitDice: 1,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: null },
  },
  critical: {
    combat: COMBAT_FIXTURES.critical,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 5,
    expendedHitDice: 2,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: null },
  },
  atZero: {
    combat: COMBAT_FIXTURES.atZero,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 5,
    expendedHitDice: 3,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: null },
  },
  atZeroWithSaves: {
    combat: COMBAT_FIXTURES.atZero,
    deathSaves: DEATH_SAVES_FIXTURES.mixed,
    level: 5,
    expendedHitDice: 3,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: null },
  },
  atMax: {
    combat: COMBAT_FIXTURES.atMax,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 5,
    expendedHitDice: 0,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: null },
  },
  withHealthFormOpen: {
    combat: COMBAT_FIXTURES.healthy,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 5,
    expendedHitDice: 0,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: "damage" },
  },
  armorPenalized: {
    combat: COMBAT_FIXTURES.armorPenalized,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 8,
    expendedHitDice: 1,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: null },
  },
  playground: {
    combat: COMBAT_FIXTURES.healthy,
    deathSaves: DEATH_SAVES_FIXTURES.none,
    level: 5,
    expendedHitDice: 0,
    tempHp: 0,
    localState: { healthInput: "", activeHealthMode: null },
  },
};
