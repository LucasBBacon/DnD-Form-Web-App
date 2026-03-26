import { useState } from "react";
import "./App.css";
import { CharacterCreationWizard } from "./components/Wizard/CharacterCreationWizard";

function App() {
  return (
    <div className="app-container">
      <CharacterCreationWizard />
    </div>
  );
}

export default App;
