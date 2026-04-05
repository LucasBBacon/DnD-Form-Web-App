import {
  getClassById,
  getFeatById,
  getFeatsByIds,
  getRaceById,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";
import type { Ability } from "../types/common";
import type { FeatAcquisitionEntry, FeatData } from "../types/feat";
import type { LevelChoice } from "../types/progression";

export interface FeatEligibilityContext {
  level: number;
  raceId: string | null;
  subraceId: string | null;
  classId: string | null;
  subclassId: string | null;
  totalScores: Record<Ability, number>;
  choicesByLevel: Record<number, LevelChoice>;
  acquiredFeats?: FeatAcquisitionEntry[];
}

export const getSelectedFeatIds = (
  currentLevel: number,
  choicesByLevel: Record<number, LevelChoice>,
  acquiredFeatsOrExactLevel: FeatAcquisitionEntry[] | boolean = [],
  maybeExactLevel = false,
): string[] => {
  const acquiredFeats = Array.isArray(acquiredFeatsOrExactLevel)
    ? acquiredFeatsOrExactLevel
    : [];
  const exactLevel =
    typeof acquiredFeatsOrExactLevel === "boolean"
      ? acquiredFeatsOrExactLevel
      : maybeExactLevel;

  const selectedFeatIds = new Set<string>();

  Object.entries(choicesByLevel).forEach(([levelKey, levelChoice]) => {
    const parsedLevel = Number(levelKey);
    if (!Number.isInteger(parsedLevel)) return;

    const isEligibleLevel = exactLevel
      ? parsedLevel === currentLevel
      : parsedLevel <= currentLevel;

    if (isEligibleLevel && levelChoice.featId) {
      selectedFeatIds.add(levelChoice.featId);
    }
  });

  acquiredFeats.forEach((entry) => {
    if (entry.source === "level_up") {
      if (entry.sourceLevel === undefined) {
        if (!exactLevel) {
          selectedFeatIds.add(entry.featId);
        }
        return;
      }

      const isEligibleLevel = exactLevel
        ? entry.sourceLevel === currentLevel
        : entry.sourceLevel <= currentLevel;

      if (isEligibleLevel) {
        selectedFeatIds.add(entry.featId);
      }
      return;
    }

    if (!exactLevel || currentLevel === 1) {
      selectedFeatIds.add(entry.featId);
    }
  });

  return Array.from(selectedFeatIds);
};

export const getOwnedFeats = (
  currentLevel: number,
  choicesByLevel: Record<number, LevelChoice>,
  acquiredFeats: FeatAcquisitionEntry[] = [],
  exactLevel = false,
): FeatData[] => {
  return getFeatsByIds(
    getSelectedFeatIds(currentLevel, choicesByLevel, acquiredFeats, exactLevel),
  );
};

const matchesRequiredIdPool = (
  selectedId: string | null,
  requiredIds: string[] | undefined,
): boolean => {
  if (!requiredIds || requiredIds.length === 0) return true;
  if (!selectedId) return false;

  return requiredIds.includes(selectedId);
};

const hasSpellcastingAccess = ({
  level,
  raceId,
  subraceId,
  classId,
  subclassId,
  choicesByLevel,
  acquiredFeats = [],
}: Omit<FeatEligibilityContext, "totalScores">): boolean => {
  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;
  const activeTraitIds = new Set<string>();

  if (classData?.spellcasting_base || subclassData?.spellcasting_override) {
    return true;
  }

  raceData?.traits?.forEach((traitId) => {
    activeTraitIds.add(traitId);
  });
  subraceData?.traits_added?.forEach((traitId) => {
    activeTraitIds.add(traitId);
  });
  classData?.progression
    .filter((entry) => entry.level <= level)
    .forEach((entry) => {
      entry.features.forEach((traitId) => {
        activeTraitIds.add(traitId);
      });
    });
  subclassData?.progression
    .filter((entry) => entry.level <= level)
    .forEach((entry) => {
      entry.features.forEach((traitId) => {
        activeTraitIds.add(traitId);
      });
    });

  resolveGrantedTraitIdsForSelectedFeats(
    level,
    choicesByLevel,
    acquiredFeats,
  ).forEach(
    (traitId) => {
      activeTraitIds.add(traitId);
    },
  );

  return getTraitsByIds(Array.from(activeTraitIds)).some((trait) =>
    trait.effects?.some((effect) => effect.type === "spell_grant"),
  );
};

export const isFeatEligible = (
  feat: FeatData,
  context: FeatEligibilityContext,
): boolean => {
  const { prerequisites } = feat;
  const selectedFeatIds = getSelectedFeatIds(
    context.level,
    context.choicesByLevel,
    context.acquiredFeats,
  );

  if (!feat.repeatable && selectedFeatIds.includes(feat.id)) {
    return false;
  }

  if (!prerequisites) return true;

  if (
    prerequisites.minimum_level !== undefined &&
    context.level < prerequisites.minimum_level
  ) {
    return false;
  }

  if (prerequisites.ability_minimums) {
    const requiredAbilities = Object.entries(prerequisites.ability_minimums) as Array<
      [Ability, number]
    >;
    const meetsAbilityRequirements = requiredAbilities.every(
      ([ability, minimum]) => context.totalScores[ability] >= minimum,
    );

    if (!meetsAbilityRequirements) return false;
  }

  if (
    !matchesRequiredIdPool(
      context.classId,
      prerequisites.required_class_ids,
    ) ||
    !matchesRequiredIdPool(
      context.subclassId,
      prerequisites.required_subclass_ids,
    ) ||
    !matchesRequiredIdPool(context.raceId, prerequisites.required_race_ids) ||
    !matchesRequiredIdPool(
      context.subraceId,
      prerequisites.required_subrace_ids,
    )
  ) {
    return false;
  }

  if (prerequisites.required_feat_ids?.length) {
    const hasRequiredFeats = prerequisites.required_feat_ids.every((featId) =>
      selectedFeatIds.includes(featId),
    );

    if (!hasRequiredFeats) return false;
  }

  if (
    prerequisites.requires_spellcasting &&
    !hasSpellcastingAccess(context)
  ) {
    return false;
  }

  return true;
};

export const resolveGrantedTraitIdsForSelectedFeats = (
  currentLevel: number,
  choicesByLevel: Record<number, LevelChoice>,
  acquiredFeatsOrExactLevel: FeatAcquisitionEntry[] | boolean = [],
  maybeExactLevel = false,
): string[] => {
  const acquiredFeats = Array.isArray(acquiredFeatsOrExactLevel)
    ? acquiredFeatsOrExactLevel
    : [];
  const exactLevel =
    typeof acquiredFeatsOrExactLevel === "boolean"
      ? acquiredFeatsOrExactLevel
      : maybeExactLevel;

  const traitIds = new Set<string>();

  getSelectedFeatIds(
    currentLevel,
    choicesByLevel,
    acquiredFeats,
    exactLevel,
  ).forEach(
    (featId) => {
      const feat = getFeatById(featId);
      feat?.granted_traits.forEach((traitId) => {
        traitIds.add(traitId);
      });
    },
  );

  return Array.from(traitIds);
};