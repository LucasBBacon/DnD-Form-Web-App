import { useEffect } from "react";
import "./App.css";
import { useCharacterStore } from "./store/useCharacterStore";
import { CharacterSheetLayout } from "./components/CharacterSheetLayout/CharacterSheetLayout";
import { CharacterCreationWizard } from "./components/CharacterCreationWizard/CharacterCreationWizard";
import { LevelUpModal } from "./components/LevelUp/LevelUpModal";
import {
  getAvailableLevelUpTargetForCharacter,
  getFirstIncompleteLevelChoice,
} from "./utils/levelAvailabilityUtils";

function App() {
  const {
    isSetupComplete,
    level,
    xp,
    levelUpMode,
    classTracks,
    choicesByLevel,
    levelUpModalState,
    openLevelUpModal,
    closeLevelUpModal,
  } = useCharacterStore();

  // Dev-only: load a named scenario from the ?scenario= URL query parameter.
  // This block is eliminated from production builds by Vite's dead-code removal.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const scenarioName = new URLSearchParams(window.location.search).get(
      "scenario",
    );
    if (!scenarioName) return;

    import("./dev/characterScenarios").then(({ buildScenarioState }) => {
      const state = buildScenarioState(scenarioName);
      if (state) {
        useCharacterStore.getState().hydrateCharacter(state);
      } else {
        console.warn(
          `[dev] Unknown scenario "${scenarioName}". Check src/dev/characterScenarios.ts for valid names.`,
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveCurrentLevel = Math.max(
    level,
    classTracks.reduce((total, track) => total + track.level, 0),
  );
  const incompleteLevel = getFirstIncompleteLevelChoice(
    effectiveCurrentLevel,
    choicesByLevel,
    classTracks,
  );

  const availableTargetLevel = isSetupComplete
    ? getAvailableLevelUpTargetForCharacter({
        xp,
        level,
        levelUpMode,
        classTracks,
        choicesByLevel,
      })
    : null;

  useEffect(() => {
    if (
      !isSetupComplete ||
      levelUpModalState.isOpen ||
      availableTargetLevel === null
    ) {
      return;
    }

    if (levelUpMode !== "xp_gated") {
      return;
    }

    openLevelUpModal(availableTargetLevel, {
      isBlocking: incompleteLevel !== null || levelUpMode === "xp_gated",
    });
  }, [
    availableTargetLevel,
    incompleteLevel,
    isSetupComplete,
    levelUpMode,
    levelUpModalState.isOpen,
    openLevelUpModal,
  ]);

  return (
    <main className="app-container">
      {isSetupComplete ? <CharacterSheetLayout /> : <CharacterCreationWizard />}
      {isSetupComplete &&
        levelUpModalState.isOpen &&
        levelUpModalState.targetLevel !== null && (
          <LevelUpModal
            targetLevel={levelUpModalState.targetLevel}
            isBlocking={levelUpModalState.isBlocking}
            onClose={closeLevelUpModal}
          />
        )}
    </main>
  );
}

export default App;
