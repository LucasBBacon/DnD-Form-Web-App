import { useEffect, useState } from "react";
import "./App.css";
import { useCharacterStore } from "./store/useCharacterStore";
import { CharacterSheet } from "./components/CharacterSheet";
import { LevelUpModal } from "./components/LevelUp/LevelUpModal";
import { CharacterCreationWizard } from "./components/CharacterCreationWizard";

function App() {
  const { isSetupComplete, resetCharacter, level, choicesByLevel } =
    useCharacterStore();

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
  const needsLevel1Setup = isSetupComplete && level === 1 && !choicesByLevel[1];
  const [showLevel1Modal, setShowLevel1Modal] = useState(true);

  return (
    <main className="app-container">
      {isSetupComplete ? <CharacterSheet /> : <CharacterCreationWizard />}
    </main>
  );
}

export default App;
