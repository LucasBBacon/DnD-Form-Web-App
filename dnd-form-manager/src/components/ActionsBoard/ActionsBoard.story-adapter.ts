import type { ActionsBoardScenario } from "./ActionsBoard.fixtures";
import {
  createMockCharacterStoreForActions,
  createMockCombatActions,
} from "../../test/createMockHooks";

/**
 * Create mock objects matching ActionsBoard hook dependencies.
 * Returns both useCombatActions and useCharacterStore mocks ready for fixture data.
 * 
 * Used in unit tests only (ActionsBoardView.test.tsx).
 * Stories render the presentational component directly with props.
 */
export function createActionsBoardMocks(scenario: ActionsBoardScenario) {
  const combatActionsMock = createMockCombatActions({
    spellcasting: scenario.spellcasting,
    sections: scenario.sections,
  });

  const characterStoreMock = createMockCharacterStoreForActions();

  return {
    useCombatActions: combatActionsMock,
    useCharacterStore: characterStoreMock,
  };
}
