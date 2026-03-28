import type { ClassData } from "../types/class";
import type { Skill } from "../types/common";
import type { SubclassData } from "../types/subclass";
import { MECHANIC_IDS } from "./constants";

export interface LevelUpRequirements {
  requiresAsiOrFeat: boolean;
  requiresSubclass: boolean;
  requiresSkillSelection: boolean;
  newCantripsToLearn: number;
  newSpellsToLearn: number;
  skillSelectionCount: number;
  skillSelectPool: Skill[];
  // TODO: add requiresInvocations, etc.
}

/**
 * Determines which player choices must be made when gaining a specific level.
 *
 * The result is derived from the selected class data for the target level. It
 * currently checks whether that level requires choosing a subclass and whether
 * it grants an Ability Score Improvement or feat selection opportunity.
 *
 * If no class data is available, the function returns a default requirements
 * object with all flags set to false.
 *
 * @param targetLevel The level being evaluated for new level-up choices.
 * @param classData The selected class definition used to inspect progression data.
 * @returns An object describing which level-up decisions are required at that level.
 */
export const getLevelUpRequirements = (
  targetLevel: number,
  classData: ClassData | null,
  subclassData: SubclassData | null = null,
): LevelUpRequirements => {
  const requirements: LevelUpRequirements = {
    requiresAsiOrFeat: false,
    requiresSubclass: false,
    requiresSkillSelection: false,
    newCantripsToLearn: 0,
    newSpellsToLearn: 0,
    skillSelectionCount: 0,
    skillSelectPool: [],
  };

  if (!classData) return requirements;

  // Check for Level 1 Class Skills
  if (targetLevel === 1) {
    requirements.requiresSkillSelection = true;
    requirements.skillSelectionCount = classData.proficiencies.skills.count;
    requirements.skillSelectPool = classData.proficiencies.skills.pool;
  }

  // Check for subclass choice
  if (classData.subclass_info.choice_level == targetLevel) {
    requirements.requiresSubclass = true;
  }

  // Check for ASI / Feat choice
  const levelData = classData.progression.find((p) => p.level === targetLevel);
  if (levelData?.features.includes(MECHANIC_IDS.ASI)) {
    requirements.requiresAsiOrFeat = true;
  }

  // Spells check (derivation)
  const prevLevelData = classData.progression.find(
    (p) => p.level == targetLevel,
  );

  const currentSpellsKnown =
    levelData?.spellcasting_progression?.spells_known || 0;
  const prevSpellsKnown =
    prevLevelData?.spellcasting_progression?.spells_known || 0;
  requirements.newCantripsToLearn = Math.max(
    0,
    currentSpellsKnown - prevSpellsKnown,
  );

  const currentCantrips =
    levelData?.spellcasting_progression?.cantrips_known || 0;
  const prevCantrips =
    prevLevelData?.spellcasting_progression?.cantrips_known || 0;
  requirements.newCantripsToLearn = Math.max(0, currentCantrips - prevCantrips);

  // TODO: Future proofing, if a bard hits level 3 and chooses the College of lore, 
  // they get 3 bonus skills. Add that check right here by looking at 
  // subclassData.progression for specific trait ID

  return requirements;
};
