/**
 * Character fixture library.
 * Reuses and exports existing character scenarios from dev/characterScenarios.ts
 * in a fixture format for use in tests and stories.
 */

import type { PartialCharacterFixture } from "../types/fixtures";
import { SCENARIO_OVERRIDES } from "../dev/characterScenarios";
import type { CharacterState } from "../store/useCharacterStore";
import { BASELINE_CHARACTER_STATE } from "../store/useCharacterStore";

/**
 * Merges a scenario override onto the baseline character state.
 * Used to create complete character fixtures from partial scenario definitions.
 */
const buildCharacterFixture = (
  scenarioOverride: Partial<CharacterState>,
): PartialCharacterFixture => {
  const merged = { ...BASELINE_CHARACTER_STATE, ...scenarioOverride };

  return {
    name: merged.name,
    playerName: merged.playerName,
    level: merged.level,
    raceId: merged.raceId,
    classId: merged.classId,
    subclassId: merged.subclassId,
    baseAbilityScores: merged.baseAbilityScores,
    tempHp: merged.tempHp,
    expendedHitDice: merged.expendedHitDice,
    deathSaves: merged.deathSaves,
  };
};

/**
 * Character scenario fixtures mapped from dev scenarios.
 * Each key corresponds to a scenario from characterScenarios.ts.
 */
export const CHARACTER_FIXTURES = {
  blank: buildCharacterFixture(SCENARIO_OVERRIDES.blank || {}),
  fighter_l1: buildCharacterFixture(SCENARIO_OVERRIDES.fighter_l1 || {}),
  barbarian_l5: buildCharacterFixture(SCENARIO_OVERRIDES.barbarian_l5 || {}),
  wizard_l12: buildCharacterFixture(SCENARIO_OVERRIDES.wizard_l12 || {}),
  fighter_rogue_mc: buildCharacterFixture(
    SCENARIO_OVERRIDES.fighter_rogue_mc || {}
  ),
  near_death: buildCharacterFixture(SCENARIO_OVERRIDES.near_death || {}),
} as const;

export type CharacterScenarioKey = keyof typeof CHARACTER_FIXTURES;
