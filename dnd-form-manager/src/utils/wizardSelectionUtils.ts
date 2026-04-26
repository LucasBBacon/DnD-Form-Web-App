import {
  getSubraceById,
  getTraitById,
} from "../data/staticDataApi";
import type { ClassData } from "../types/class";
import type { Race } from "../types/race";
import type { SelectionOption, TraitSegment } from "../types/wizardSelection";

const UNRESOLVED_TRAIT_SHORT = "Trait data could not be resolved.";
const UNRESOLVED_TRAIT_FULL =
  "This trait reference exists in static data, but no matching trait entry was found.";

const toTraitSegment = (traitId: string): TraitSegment => {
  const trait = getTraitById(traitId);

  if (!trait) {
    return {
      name: `Unknown Trait (${traitId})`,
      shortDescription: UNRESOLVED_TRAIT_SHORT,
      fullDescription: UNRESOLVED_TRAIT_FULL,
    };
  }

  const shortDescription = trait.lore.shortDescription?.trim() || "No summary available.";
  const fullDescription = trait.lore.fullText?.trim() || shortDescription;

  return {
    name: trait.name,
    shortDescription,
    fullDescription,
  };
};

export const resolveTraitSegments = (traitIds: string[] | undefined): TraitSegment[] => {
  if (!traitIds || traitIds.length === 0) {
    return [];
  }

  const uniqueIds = Array.from(new Set(traitIds));
  return uniqueIds.map(toTraitSegment);
};

export const toRaceSelectionOption = (
  race: Race,
  selectedSubraceId: string | null,
): SelectionOption => {
  const selectedSubrace = selectedSubraceId
    ? getSubraceById(selectedSubraceId)
    : null;
  const subraceTraitIds =
    selectedSubrace?.parentRaceId === race.id
      ? selectedSubrace.traitsAdded ?? []
      : [];
  const traitIds = [...(race.traits ?? []), ...subraceTraitIds];

  return {
    id: race.id,
    name: race.name,
    tagline: race.lore.shortDescription,
    description: race.lore.fullText || race.lore.shortDescription,
    traits: resolveTraitSegments(traitIds),
  };
};

export const toClassSelectionOption = (classData: ClassData): SelectionOption => {
  const levelOneTraits =
    classData.progression.find((level) => level.level === 1)?.features ?? [];

  return {
    id: classData.id,
    name: classData.name,
    tagline: `Hit Die: d${classData.hitDie}`,
    description: classData.lore.fullText || classData.lore.shortDescription,
    traits: resolveTraitSegments(levelOneTraits),
  };
};
