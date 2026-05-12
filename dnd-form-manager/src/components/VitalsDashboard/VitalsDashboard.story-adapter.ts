/**
 * Story adapter for VitalsDashboard.
 * Handles mock setup for stories by creating compatible mock objects
 * from fixtures using the createMockHooks utilities.
 */

import { vi } from "vitest";
import {
  createMockCharacterStats,
  createMockCharacterStoreForVitals,
} from "../../test/createMockHooks";
import type { VitalsDashboardScenario } from "./VitalsDashboard.fixtures";

/**
 * Mock objects that can be set up for a story.
 * Used with Vitest mocking in tests and Storybook decorators in stories.
 */
export interface VitalsDashboardMocks {
  useCharacterStore: ReturnType<typeof createMockCharacterStoreForVitals>;
  useCharacterStats: ReturnType<typeof createMockCharacterStats>;
}

/**
 * Creates mock hook objects from a VitalsDashboard scenario fixture.
 * Use this in story decorators or test setup to mock the hooks.
 */
export const createVitalsDashboardMocks = (
  scenario: VitalsDashboardScenario,
  callbacks?: {
    takeDamage?: (amount: number) => void;
    heal?: (amount: number) => void;
    setTempHp?: (amount: number) => void;
    recordDeathSave?: (type: "success" | "failure", checked: boolean) => void;
    openRestModal?: (type: "short" | "long") => void;
  }
): VitalsDashboardMocks => {
  const characterStoreMock = createMockCharacterStoreForVitals(
    scenario.level,
    scenario.tempHp,
    scenario.deathSaves,
    scenario.expendedHitDice,
    callbacks
  );

  const characterStatsMock = createMockCharacterStats(scenario.combat);

  return {
    useCharacterStore: characterStoreMock as never,
    useCharacterStats: characterStatsMock,
  };
};

/**
 * Sets up Vitest mocks for VitalsDashboard from a scenario.
 * Use this in test setup (beforeEach) to mock the hooks.
 *
 * Example:
 *   beforeEach(() => {
 *     setupVitalsDashboardMocks(VITALS_DASHBOARD_FIXTURES.healthy);
 *   });
 */
export const setupVitalsDashboardMocks = (
  scenario: VitalsDashboardScenario,
  callbacks?: Parameters<typeof createVitalsDashboardMocks>[1]
): VitalsDashboardMocks => {
  const mocks = createVitalsDashboardMocks(scenario, callbacks);

  // Mock the store
  vi.mocked(useCharacterStore).mockReturnValue(
    mocks.useCharacterStore as never
  );

  // Mock useCharacterStats
  vi.mocked(useCharacterStats).mockReturnValue(mocks.useCharacterStats);

  return mocks;
};

/**
 * Type-safe accessor for importing the hooks that need to be mocked.
 * Re-export the actual hooks so Vitest can find them for mocking.
 */
export { useCharacterStore } from "../../store/useCharacterStore";
export { useCharacterStats } from "../../hooks/useCharacterStats";
