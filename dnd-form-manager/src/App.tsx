import React from "react";
import "./App.css";
import { CharacterCreationWizard } from "./components/Wizard/CharacterCreationWizard";
import { useCharacterStore } from "./store/useCharacterStore";
import { CharacterSheet } from "./components/CharacterSheet";

function App() {
  const { isSetupComplete, resetCharacter } = useCharacterStore();

  return (
    <div className="app-container">
      {/*
        TODO: Add a subtle navbar that lets users wipe the state clean if they want.
        A real app this might be hidden or put in a settings menu
      */}
      {isSetupComplete && (
        <nav className="top-nav">
          <button onClick={resetCharacter} className="danger-btn">
            Roll New Character
          </button>
        </nav>
      )}

      {/* Conditional core renderer */}
      {!isSetupComplete ? <CharacterCreationWizard /> : <CharacterSheet />}
    </div>
  );
}

export default App;
