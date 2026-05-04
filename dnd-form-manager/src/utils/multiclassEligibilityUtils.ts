import type { Ability } from "../types/common";

type RequirementOption = Partial<Record<Ability, number>>;

const MULTICLASS_ABILITY_REQUIREMENTS: Record<string, RequirementOption[]> = {
  class_barbarian: [{ str: 13 }],
  class_bard: [{ cha: 13 }],
  class_cleric: [{ wis: 13 }],
  class_druid: [{ wis: 13 }],
  class_fighter: [{ str: 13 }, { dex: 13 }],
  class_monk: [{ dex: 13, wis: 13 }],
  class_paladin: [{ str: 13, cha: 13 }],
  class_ranger: [{ dex: 13, wis: 13 }],
  class_rogue: [{ dex: 13 }],
  class_sorcerer: [{ cha: 13 }],
  class_warlock: [{ cha: 13 }],
  class_wizard: [{ int: 13 }],
};

export type MulticlassEligibilityFailureCode =
  | "already_has_class"
  | "character_level_too_low"
  | "missing_current_class"
  | "missing_ability_score"
  | "ability_score_below_minimum";

export interface MulticlassEligibilityFailure {
  code: MulticlassEligibilityFailureCode;
  classId?: string;
  ability?: Ability;
  required?: number;
  actual?: number;
}

export interface MulticlassEligibilityContext {
  currentClassIds: string[];
  targetClassId: string;
  currentCharacterLevel: number;
  totalScores: Partial<Record<Ability, number>>;
}

export interface MulticlassEligibilityResult {
  eligible: boolean;
  failures: MulticlassEligibilityFailure[];
}

const getRequirementDeficits = (
  classId: string,
  totalScores: Partial<Record<Ability, number>>,
  option: RequirementOption,
): MulticlassEligibilityFailure[] => {
  const deficits: MulticlassEligibilityFailure[] = [];

  (Object.entries(option) as [Ability, number][]).forEach(([ability, required]) => {
    const actual = totalScores[ability];

    if (typeof actual !== "number") {
      deficits.push({
        code: "missing_ability_score",
        classId,
        ability,
        required,
      });
      return;
    }

    if (actual < required) {
      deficits.push({
        code: "ability_score_below_minimum",
        classId,
        ability,
        required,
        actual,
      });
    }
  });

  return deficits;
};

const evaluateClassRequirement = (
  classId: string,
  totalScores: Partial<Record<Ability, number>>,
): MulticlassEligibilityFailure[] => {
  const options = MULTICLASS_ABILITY_REQUIREMENTS[classId];
  if (!options || options.length === 0) {
    return [];
  }

  let bestDeficits: MulticlassEligibilityFailure[] | null = null;

  options.forEach((option) => {
    const deficits = getRequirementDeficits(classId, totalScores, option);
    if (deficits.length === 0) {
      bestDeficits = [];
      return;
    }

    if (!bestDeficits || deficits.length < bestDeficits.length) {
      bestDeficits = deficits;
    }
  });

  return bestDeficits ?? [];
};

export const getMulticlassAbilityRequirementOptions = (
  classId: string,
): RequirementOption[] => MULTICLASS_ABILITY_REQUIREMENTS[classId] ?? [];

export const evaluateMulticlassEligibility = ({
  currentClassIds,
  targetClassId,
  currentCharacterLevel,
  totalScores,
}: MulticlassEligibilityContext): MulticlassEligibilityResult => {
  const failures: MulticlassEligibilityFailure[] = [];

  if (currentCharacterLevel < 2) {
    failures.push({ code: "character_level_too_low" });
  }

  if (currentClassIds.length === 0) {
    failures.push({ code: "missing_current_class" });
  }

  if (currentClassIds.includes(targetClassId)) {
    failures.push({ code: "already_has_class", classId: targetClassId });
  }

  const classIdsToValidate = Array.from(new Set([...currentClassIds, targetClassId]));
  classIdsToValidate.forEach((classId) => {
    failures.push(...evaluateClassRequirement(classId, totalScores));
  });

  return {
    eligible: failures.length === 0,
    failures,
  };
};
