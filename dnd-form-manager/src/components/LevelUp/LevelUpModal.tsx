import { getClassById, getSubclassById } from "../../data/staticDataApi";
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
  const { classId, subclassId, setLevel, updateLevelChoice, setSubclass } =
    useCharacterStore();

  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;

  // Determine modules to render
  const requirements = getLevelUpRequirements(
    targetLevel,
    classData,
    subclassData,
  );

  // Universal save handler
  const handleSaveChoice = (updates: Partial<LevelChoice>) => {
    updateLevelChoice(targetLevel, updates);
  };

  const finalizeLevelUp = () => {
    setLevel(targetLevel);
    onClose();
  };

  return (
    <div className="modal level-up-wizard">
      <h2>Leveling up to {targetLevel}!</h2>

      {/* Render subclass picker if required */}
      {requirements.requiresSubclass && classId && (
        <div className="choice-block">
          <h3>Choose your Martial Archetype</h3>
          <select onChange={(e) => setSubclass(e.target.value)}>
            {/* Map over getSubclassesForClass(classId) here */}
          </select>
        </div>
      )}

      {/* Render Skill picker if required */}
      {requirements.requiresSkillSelection && (
        <SkillChoiceBlock
          level={targetLevel}
          count={requirements.skillSelectionCount}
          pool={requirements.skillSelectPool}
          onSave={handleSaveChoice}
        />
      )}

      {/* Render ASI/Feat Picker if required */}
      {requirements.requiresAsiOrFeat && (
        <ASIChoiceBlock level={targetLevel} onSave={handleSaveChoice} />
      )}

      {/* Render HP Roller (Required every level after 1) */}
      {targetLevel > 1 && (
        <div className="choice-block">
          <input
            type="number"
            placeholder={`Roll 1d${classData?.hit_die}`}
            onChange={(e) =>
              handleSaveChoice({ hpGained: Number(e.target.value) })
            }
          />
        </div>
      )}

      <button className="finalize-btn" onClick={finalizeLevelUp}>
        Complete Level Up
      </button>
    </div>
  );
};
