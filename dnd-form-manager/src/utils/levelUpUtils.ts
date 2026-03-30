import type { ClassData } from "../types/class";
import type { SubclassData } from "../types/subclass";
import { getPendingSkillChoices } from "./choiceUtils";
import { MECHANIC_IDS } from "./constants";

export interface LevelUpRequirements {
  requiresAsiOrFeat: boolean;
  requiresSubclass: boolean;
  requiresSkillSelection: boolean;
  newCantripsToLearn: number;
  newSpellsToLearn: number;
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
  raceId: string | null = null,
  subraceId: string | null = null,
  classData: ClassData | null = null,
  subclassData: SubclassData | null = null,
): LevelUpRequirements => {
  const requirements: LevelUpRequirements = {
    requiresAsiOrFeat: false,
    requiresSubclass: false,
    requiresSkillSelection: false,
    newCantripsToLearn: 0,
    newSpellsToLearn: 0,
  };

  if (!classData) return requirements;

  // #region Subclass Check
  if (classData.subclass_info.choice_level == targetLevel) {
    requirements.requiresSubclass = true;
  }
  // #endregion

  // #region Skill Choice Check
  const pendingSkillChoices = getPendingSkillChoices(
    targetLevel,
    raceId,
    subraceId,
    classData.id,
    subclassData?.id || null,
  );

  if (pendingSkillChoices.length > 0) {
    requirements.requiresSkillSelection = true;
  }
  // #endregion

  const levelData = classData.progression.find((p) => p.level === targetLevel);

  // #region ASI / Feat Choice
  if (levelData?.features.includes(MECHANIC_IDS.ASI)) {
    requirements.requiresAsiOrFeat = true;
  }
  // #endregion

  // #region Spells Check (derivation)
  const prevLevelData = classData.progression.find(
    (p) => p.level === targetLevel - 1,
  );

  const currentSpellsKnown =
    levelData?.spellcasting_progression?.spells_known || 0;
  const prevSpellsKnown =
    prevLevelData?.spellcasting_progression?.spells_known || 0;
  requirements.newSpellsToLearn = Math.max(
    0,
    currentSpellsKnown - prevSpellsKnown,
  );

  const currentCantrips =
    levelData?.spellcasting_progression?.cantrips_known || 0;
  const prevCantrips =
    prevLevelData?.spellcasting_progression?.cantrips_known || 0;
  requirements.newCantripsToLearn = Math.max(0, currentCantrips - prevCantrips);

  // #endregion

  return requirements;
};
