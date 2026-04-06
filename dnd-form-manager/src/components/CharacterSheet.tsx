import { useState } from "react";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import {
  getClassById,
  getRaceById,
  getSubclassById,
  getSubraceById,
} from "../data/staticDataApi";
import { SkillAndSavesBlock } from "./SkillAndSavesBlock";
import { CombatDashboard } from "./CombatDashboard";
import { CombatStatsBlock } from "./CombatStatsBlock";
import { InventoryBlock } from "./InventoryBlock";
import { SpellSlotsTracker } from "./SpellSlotsTracker";
import { SpellbookBlock } from "./SpellbookBlock";
import { LevelUpModal } from "./LevelUp/LevelUpModal";
import { AttacksBlock } from "./AttacksBlock";

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

export const CharacterSheet = () => {
  const { name, level, raceId, subraceId, classId, subclassId } =
    useCharacterStore();
  const { abilities } = useCharacterStats();

  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // Safely fetch static names for header
  const raceName = raceId ? getRaceById(raceId)?.name : "Unknown Race";
  const subraceName = subraceId ? getSubraceById(subraceId)?.name : "";
  const className = classId ? getClassById(classId)?.name : "Unknown Class";
  const subclassName = subclassId ? getSubclassById(subclassId)?.name : "";

  // Helpers
  const fullRace = subraceName ? `${subraceName} ${raceName}` : raceName;
  const fullClass = subclassName ? `${subclassName} ${className}` : className;

  return (
    <div className="character-sheet-layout">
      {/* Header */}
      <header className="sheet-header">
        <div className="character-identity">
          <h1>{name || "Unnamed Adventurer"}</h1>
          <h2>
            Level {level} {fullRace} {fullClass}
          </h2>
        </div>
        <button
          className="level-up-trigger"
          onClick={() => setIsLevelingUp(true)}
        >
          Level Up
        </button>
      </header>

      {/* Main 3 Column Grid */}
      <div className="sheet-grid">
        {/* Col 1: Physics and Proficiencies */}
        <div className="sheet-column left-column">
          {/* Quick Ability Score display */}
          <div className="ability-scores-row">
            {ABILITIES.map((stat) => (
              <div key={stat} className="ability-box">
                <span className="ability-name">{stat.toUpperCase()}</span>
                <span className="ability-mod">
                  {abilities.modifiers[stat] >= 0
                    ? `+${abilities.modifiers[stat]}`
                    : abilities.modifiers[stat]}
                </span>
              </div>
            ))}
          </div>

          <SkillAndSavesBlock />
        </div>

        {/* Col 2: Combat Engine */}
        <div className="sheet-column center-column">
          <CombatStatsBlock />
          <CombatDashboard />
          <AttacksBlock />
        </div>

        {/* Col 3: Gear and Magic */}
        <div className="sheet-column right-column">
          <InventoryBlock />

          {/* Only render spellcasting if they have spells */}
          <div className="magic-section">
            <SpellSlotsTracker />
            <SpellbookBlock />
          </div>
        </div>
      </div>

      {/* Modals */}
      {isLevelingUp && (
        <div className="modal-backdrop">
          <LevelUpModal
            targetLevel={level + 1}
            onClose={() => setIsLevelingUp(false)}
          />
        </div>
      )}
    </div>
  );
};
