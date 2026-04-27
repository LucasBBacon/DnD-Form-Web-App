import {
  getSubraceById,
  getSubracesForRace,
  getSubclassesForClass,
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

  const subraces = getSubracesForRace(race.id);
  const subOptions = subraces.map((sub) => ({
    id: sub.id,
    name: sub.name,
    tagline: sub.lore.shortDescription,
    description: sub.lore.fullText || sub.lore.shortDescription,
    traits: resolveTraitSegments(sub.traitsAdded),
  }));

  return {
    id: race.id,
    name: race.name,
    tagline: race.lore.shortDescription,
    description: race.lore.fullText || race.lore.shortDescription,
    traits: resolveTraitSegments(traitIds),
    ...(subOptions.length > 0 && { subOptions, subOptionLabel: "Subrace" }),
  };
};

export const toClassSelectionOption = (classData: ClassData): SelectionOption => {
  const levelOneTraits =
    classData.progression.find((level) => level.level === 1)?.features ?? [];

  const subclasses = getSubclassesForClass(classData.id);
  const subOptions = subclasses.map((sub) => {
    const levelThreeTraits =
      sub.progression.find((level) => level.level === 3)?.features ?? [];
    return {
      id: sub.id,
      name: sub.name,
      tagline: sub.lore?.shortDescription ?? `${classData.name} subclass`,
      description: sub.lore?.fullText ?? sub.lore?.shortDescription ?? `${sub.name} is a subclass of ${classData.name}.`,
      traits: resolveTraitSegments(levelThreeTraits),
    };
  });

  return {
    id: classData.id,
    name: classData.name,
    tagline: `Hit Die: d${classData.hitDie}`,
    description: classData.lore.fullText || classData.lore.shortDescription,
    traits: resolveTraitSegments(levelOneTraits),
    ...(subOptions.length > 0 && { subOptions, subOptionLabel: "Subclass" }),
  };
};
