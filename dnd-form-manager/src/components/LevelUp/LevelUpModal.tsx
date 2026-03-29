import { useState } from "react";
import {
  getClassById,
  getSubclassById,
  getSubclassesForClass,
} from "../../data/staticDataApi";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { LevelChoice } from "../../types/progression";
import { getLevelUpRequirements } from "../../utils/levelUpUtils";
import { ASIChoiceBlock } from "./ASIChoiceBlock";
import { SkillChoiceBlock } from "./SkillChoiceBlock";

interface LevelUpModalProps {
  targetLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  targetLevel,
  onClose,
}) => {
  // Fetch from zustand
  const {
    raceId,
    subraceId,
    classId,
    subclassId,
    setLevel,
    updateLevelChoice,
    setSubclass,
  } = useCharacterStore();

  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;
  const availableSubclasses = classId ? getSubclassesForClass(classId) : [];

  // Determine modules to render
  const requirements = getLevelUpRequirements(
    targetLevel,
    raceId,
    subraceId,
    classData,
    subclassData,
  );

  // #region Draft State
  
  const [draftChoices, setDraftChoices] = useState<Partial<LevelChoice>>({});
  
  // #endregion

  // #region Dynamic Validity States

  const [isAsiValid, setIsAsiValid] = useState(!requirements.requiresAsiOrFeat);
  const [isSkillsValid, setIsSkillsValid] = useState(!requirements.requiresSkillSelection);
  const [isHpValid, setIsHpValid] = useState(targetLevel === 1);
  
  // don't need local state for subclass/HP, just check if they are valid
  const isSubclassValid = !requirements.requiresSubclass || subclassId !== null;
  
  // Master check
  const canFinalize = isAsiValid && isSkillsValid && isSubclassValid && isHpValid;

  // #endregion
  
  // #region Event Handlers

  const handleDraftUpdate = (updates: Partial<LevelChoice>, isValid: boolean, type: 'asi' | 'skills' | 'hp') => {
    setDraftChoices(prev => ({...prev, ...updates}));
    if (type === 'asi') setIsAsiValid(isValid);
    if (type === 'skills') setIsSkillsValid(isValid);
    if (type === 'hp') setIsHpValid(isValid);
  };

  const finalizeLevelUp = () => {
    updateLevelChoice(targetLevel, draftChoices);
    setLevel(targetLevel);
    onClose();
  };

  return (
    <div className="modal level-up-wizard">
      <h2>
        {targetLevel === 1
          ? "Finalize Character Creation"
          : `Leveling up to ${targetLevel}!`}
      </h2>

      {/* Render subclass picker if required */}
      {requirements.requiresSubclass && classId && (
        <div className="choice-block">
          <h3>Choose your Martial Archetype</h3>
          <select
            value={subclassId || ""}
            onChange={(e) => setSubclass(e.target.value)}
          >
            <option value="" disabled>
              Select an archetype...
            </option>
            {availableSubclasses.map((subclass) => (
              <option key={subclass.id} value={subclass.id}>
                {subclass.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Render Skill picker if required */}
      {requirements.requiresSkillSelection && (
        <SkillChoiceBlock
          level={targetLevel}
          onChange={(draft, isValid) => handleDraftUpdate(draft, isValid, 'skills')}
        />
      )}

      {/* Render ASI/Feat Picker if required */}
      {requirements.requiresAsiOrFeat && (
        <ASIChoiceBlock
          level={targetLevel}
          onChange={(draft, isValid) => handleDraftUpdate(draft, isValid, 'asi')}
        />
      )}

      {/* Render HP Roller (Required every level after 1) */}
      {targetLevel > 1 && (
        <div className="choice-block">
          <input
            type="number"
            placeholder={`Roll 1d${classData?.hit_die}`}
            onChange={(e) => {
              const val = Number(e.target.value);
              handleDraftUpdate({ hpGained: val}, val > 0, 'hp');
            }
            }
          />
        </div>
      )}

      <button
        className="finalize-btn"
        onClick={finalizeLevelUp}
        disabled={!canFinalize}
      >
        {targetLevel === 1 ? "Enter Game" : "Complete Level Up"}
      </button>
    </div>
  );
};
