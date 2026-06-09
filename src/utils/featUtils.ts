import {
  getClassById,
  getFeatById,
  getFeatsByIds,
  getRaceById,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";
import { ABILITIES_KEY_LABEL } from "./abilityConstants";
import type { Ability } from "../types/common";
import type { FeatAcquisitionEntry, FeatData } from "../types/feat";
import type { LevelChoice } from "../types/progression";

export interface OwnedFeatWithSource {
  feat: FeatData;
  source: FeatAcquisitionEntry["source"];
  sourceLevel?: number;
}

const isFeatEligibleAtLevel = (
  currentLevel: number,
  sourceLevel: number | undefined,
  exactLevel: boolean,
): boolean => {
  if (sourceLevel === undefined) {
    return !exactLevel;
  }

  return exactLevel
    ? sourceLevel === currentLevel
    : sourceLevel <= currentLevel;
};

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

export const getOwnedFeatsWithSources = (
  currentLevel: number,
  choicesByLevel: Record<number, LevelChoice>,
  acquiredFeats: FeatAcquisitionEntry[] = [],
  exactLevel = false,
): OwnedFeatWithSource[] => {
  const ownedFeatsById = new Map<string, OwnedFeatWithSource>();

  Object.entries(choicesByLevel).forEach(([levelKey, levelChoice]) => {
    const parsedLevel = Number(levelKey);
    if (!Number.isInteger(parsedLevel) || !levelChoice.featId) return;
    if (!isFeatEligibleAtLevel(currentLevel, parsedLevel, exactLevel)) return;

    const feat = getFeatById(levelChoice.featId);
    if (!feat) return;

    ownedFeatsById.set(levelChoice.featId, {
      feat,
      source: "level_up",
      sourceLevel: parsedLevel,
    });
  });

  acquiredFeats.forEach((entry) => {
    const isEligible =
      entry.source === "origin"
        ? !exactLevel || currentLevel === 1
        : isFeatEligibleAtLevel(currentLevel, entry.sourceLevel, exactLevel);

    if (!isEligible) return;

    const feat = getFeatById(entry.featId);
    if (!feat) return;

    const existing = ownedFeatsById.get(entry.featId);
    if (
      existing &&
      existing.source === "level_up" &&
      existing.sourceLevel !== undefined
    ) {
      return;
    }

    ownedFeatsById.set(entry.featId, {
      feat,
      source: entry.source,
      sourceLevel: entry.sourceLevel,
    });
  });

  return Array.from(ownedFeatsById.values());
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

  raceData?.traits?.forEach((traitId) => {
    activeTraitIds.add(traitId);
  });
  subraceData?.traitsAdded?.forEach((traitId) => {
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

  return getTraitsByIds(Array.from(activeTraitIds)).some(
    (trait) =>
      !!trait.spellcasting ||
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
    prerequisites.minimumLevel !== undefined &&
    context.level < prerequisites.minimumLevel
  ) {
    return false;
  }

  if (prerequisites.abilityMinimums) {
    const requiredAbilities = Object.entries(prerequisites.abilityMinimums) as Array<
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
      prerequisites.requiredClassIds,
    ) ||
    !matchesRequiredIdPool(
      context.subclassId,
      prerequisites.requiredSubclassIds,
    ) ||
    !matchesRequiredIdPool(context.raceId, prerequisites.requiredRaceIds) ||
    !matchesRequiredIdPool(
      context.subraceId,
      prerequisites.requiredSubraceIds,
    )
  ) {
    return false;
  }

  if (prerequisites.requiredFeatIds?.length) {
    const hasRequiredFeats = prerequisites.requiredFeatIds.every((featId) =>
      selectedFeatIds.includes(featId),
    );

    if (!hasRequiredFeats) return false;
  }

  if (
    prerequisites.requiresSpellcasting &&
    !hasSpellcastingAccess(context)
  ) {
    return false;
  }

  return true;
};

const formatIdLabel = (value: string): string =>
  value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());

const getAbilityLabel = (ability: Ability): string => {
  const label = ABILITIES_KEY_LABEL.find((entry) => entry.key === ability)?.label;
  return label ?? ability.toUpperCase();
};

const joinPrerequisiteParts = (parts: string[]): string =>
  parts.length <= 1
    ? parts[0] ?? ""
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;

export const formatFeatPrerequisites = (feat: FeatData): string | null => {
  const prerequisites = feat.prerequisites;
  if (!prerequisites) return null;

  const parts: string[] = [];

  if (prerequisites.minimumLevel !== undefined) {
    parts.push(`level ${prerequisites.minimumLevel}`);
  }

  if (prerequisites.abilityMinimums) {
    const abilityText = Object.entries(prerequisites.abilityMinimums)
      .map(([ability, minimum]) => `${getAbilityLabel(ability as Ability)} ${minimum}`)
      .join(", ");

    if (abilityText) {
      parts.push(abilityText);
    }
  }

  if (prerequisites.requiredFeatIds?.length) {
    const requiredFeatNames = prerequisites.requiredFeatIds.map((featId) =>
      getFeatById(featId)?.name ?? formatIdLabel(featId),
    );

    parts.push(`feat ${joinPrerequisiteParts(requiredFeatNames)}`);
  }

  const requiredClassNames = prerequisites.requiredClassIds?.map((classId) =>
    getClassById(classId)?.name ?? formatIdLabel(classId),
  );
  if (requiredClassNames?.length) {
    parts.push(`class ${joinPrerequisiteParts(requiredClassNames)}`);
  }

  const requiredSubclassNames = prerequisites.requiredSubclassIds?.map((subclassId) =>
    getSubclassById(subclassId)?.name ?? formatIdLabel(subclassId),
  );
  if (requiredSubclassNames?.length) {
    parts.push(`subclass ${joinPrerequisiteParts(requiredSubclassNames)}`);
  }

  const requiredRaceNames = prerequisites.requiredRaceIds?.map((raceId) =>
    getRaceById(raceId)?.name ?? formatIdLabel(raceId),
  );
  if (requiredRaceNames?.length) {
    parts.push(`race ${joinPrerequisiteParts(requiredRaceNames)}`);
  }

  const requiredSubraceNames = prerequisites.requiredSubraceIds?.map((subraceId) =>
    getSubraceById(subraceId)?.name ?? formatIdLabel(subraceId),
  );
  if (requiredSubraceNames?.length) {
    parts.push(`subrace ${joinPrerequisiteParts(requiredSubraceNames)}`);
  }

  if (prerequisites.requiresSpellcasting) {
    parts.push("spellcasting");
  }

  if (parts.length === 0) {
    return null;
  }

  return `Prerequisite: ${joinPrerequisiteParts(parts)}`;
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
      feat?.grantedTraits.forEach((traitId) => {
        traitIds.add(traitId);
      });
    },
  );

  return Array.from(traitIds);
};