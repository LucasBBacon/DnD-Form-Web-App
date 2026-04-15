import { useState } from "react";
import { useSkills } from "../hooks/useSkills";
import { SkillsBlock } from "./SkillsBlock/SkillsBlock";
import { PlaceholderSkills } from "./Placeholders/PlaceholderSkills";
import { PlaceholderSavingThrows } from "./Placeholders/PlaceholderSavingThrows";
import { PlaceholderProfBonus } from "./Placeholders/PlaceholderProfBonus";
import { PlaceholderInspiration } from "./Placeholders/PlaceholderInspiration";
import { PlaceholderAbilities } from "./Placeholders/PlaceholderAbilities";
import { PlaceholderPassivePerception } from "./Placeholders/PlaceholderPassivePerception";
import PlaceholderProficienciesLanguages from "./Placeholders/PlaceholderProficienciesLanguages";
import { PlaceholderCombatStats } from "./Placeholders/PlaceholderCombatStats";

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
        <img 
          src="../../src/assets/5E_CharacterSheet_Fillable-1.png"
          alt="Character Sheet Background"
          className="sheet-background-image"
        />
        <div className="sheet-item sheet-item-abilities">
          <PlaceholderAbilities />
        </div>
        <div className="sheet-item sheet-item-saving-throws">
          <PlaceholderSavingThrows />
        </div>
        <div className="sheet-item sheet-item-skills">
          <PlaceholderSkills />
        </div>
        <div className="sheet-item sheet-item-proficiency-bonus">
          <PlaceholderProfBonus />
        </div>
        <div className="sheet-item sheet-item-inspiration">
          <PlaceholderInspiration />
        </div>
        <div className="sheet-item sheet-item-passive-perception">
          <PlaceholderPassivePerception />
        </div>
        <div className="sheet-item sheet-item-proficiencies-languages">
          <PlaceholderProficienciesLanguages />
        </div>
        <div className="sheet-item sheet-item-combat-stats">
          <PlaceholderCombatStats />
        </div>
      </div>
    </div>
  );
};
