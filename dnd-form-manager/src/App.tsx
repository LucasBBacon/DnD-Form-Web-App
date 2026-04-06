import { useState } from "react";
import "./App.css";
import { CharacterCreationWizard } from "./components/Wizard/CharacterCreationWizard";
import { useCharacterStore } from "./store/useCharacterStore";
import { CharacterSheet } from "./components/CharacterSheet";
import { LevelUpModal } from "./components/LevelUp/LevelUpModal";

function App() {
  const { isSetupComplete, resetCharacter, level, choicesByLevel } =
    useCharacterStore();
  const needsLevel1Setup = isSetupComplete && level === 1 && !choicesByLevel[1];
  const [showLevel1Modal, setShowLevel1Modal] = useState(true);

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

      {/* Conditional core renderer 
      {!isSetupComplete ? (
        <CharacterCreationWizard />
      ) : (
        <>
          <CharacterSheet />

          {needsLevel1Setup && showLevel1Modal && (
            <div className="modal-overlay">
              <LevelUpModal
                targetLevel={1}
                onClose={() => setShowLevel1Modal(false)}
              />
            </div>
          )}
        </>
      )}*/}
        <>
          <CharacterSheet />
        </>
    </div>
  );
}

export default App;
