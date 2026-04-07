import { useState } from "react";
import { useSkills } from "../hooks/useSkills";
import { SkillsBlock } from "./SkillsBlock/SkillsBlock";

export const CharacterSheet = () => {
  const { calculatedSkills } = useSkills();
  const [showLayoutGuides, setShowLayoutGuides] = useState(false);

  return (
    <div className="character-sheet-layout">
      <button
        className="layout-guides-toggle"
        type="button"
        onClick={() => setShowLayoutGuides((prev) => !prev)}
        aria-pressed={showLayoutGuides}
      >
        {showLayoutGuides ? "Hide Layout Grid" : "Show Layout Grid"}
      </button>
      <div
        className={`sheet-canvas${showLayoutGuides ? " layout-guides-visible" : ""}`}
        aria-label="Character Sheet"
      >
        <div className="sheet-item sheet-item-skills">
          <SkillsBlock calculatedSkills={calculatedSkills} />
        </div>
      </div>
    </div>
  );
};
