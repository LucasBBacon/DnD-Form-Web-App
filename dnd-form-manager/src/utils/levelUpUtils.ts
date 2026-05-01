import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { ClassData } from "../types/class";
import type { LevelChoice } from "../types/progression";
import type { SubclassData } from "../types/subclass";
import { getPendingProficiencyChoices } from "./choiceUtils";
import { MECHANIC_IDS } from "./constants";

export interface LevelUpRequirements {
  requiresAsiOrFeat: boolean;
  requiresSubclass: boolean;
  requiresProficiencySelection: boolean;
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
  classLevel: number = targetLevel,
  choicesByLevel: Record<number, LevelChoice> = {},
  classTracks: CharacterClassTrack[] = [],
): LevelUpRequirements => {
  const requirements: LevelUpRequirements = {
    requiresAsiOrFeat: false,
    requiresSubclass: false,
    requiresProficiencySelection: false,
    requiresSkillSelection: false,
    newCantripsToLearn: 0,
    newSpellsToLearn: 0,
  };

  if (!classData) return requirements;

  // #region Subclass Check
  if (classData.subclassInfo.choiceLevel === classLevel) {
    requirements.requiresSubclass = true;
  }
  // #endregion

  // #region Skill Choice Check
  const pendingProficiencyChoices = getPendingProficiencyChoices(
    targetLevel,
    raceId,
    subraceId,
    classData.id,
    subclassData?.id || null,
    choicesByLevel,
    classTracks,
  );

  if (pendingProficiencyChoices.length > 0) {
    requirements.requiresProficiencySelection = true;
    requirements.requiresSkillSelection = pendingProficiencyChoices.some(
      (choice) => choice.category === "skills",
    );
  }
  // #endregion

  const levelData = classData.progression.find((p) => p.level === classLevel);

  // #region ASI / Feat Choice
  if (levelData?.features.includes(MECHANIC_IDS.ASI)) {
    requirements.requiresAsiOrFeat = true;
  }
  // #endregion

  // #region Spells Check (derivation)
  const prevLevelData = classData.progression.find(
    (p) => p.level === classLevel - 1,
  );

  const currentSpellsKnown =
    levelData?.spellcastingProgression?.spellsKnown || 0;
  const prevSpellsKnown =
    prevLevelData?.spellcastingProgression?.spellsKnown || 0;
  requirements.newSpellsToLearn = Math.max(
    0,
    currentSpellsKnown - prevSpellsKnown,
  );

  const currentCantrips =
    levelData?.spellcastingProgression?.cantripsKnown || 0;
  const prevCantrips =
    prevLevelData?.spellcastingProgression?.cantripsKnown || 0;
  requirements.newCantripsToLearn = Math.max(0, currentCantrips - prevCantrips);

  // #endregion

  return requirements;
};
