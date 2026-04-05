import type { Race } from "../types/race";
import type { SubraceData } from "../types/subrace";
import type { ClassData } from "../types/class";
import type { SubclassData } from "../types/subclass";
import type { ItemData } from "../types/item";
import type { SpellData } from "../types/spell";
import type { FeatData } from "../types/feat";
import type { TraitData } from "../types/trait";

import rawRacesData from "./races.json";
import rawSubracesData from "./subraces.json";
import rawClassesData from "./classes.json";
import rawSubclassesData from "./subclasses.json";
import rawItemsData from "./items.json";
import rawSpellsData from "./spells.json";
import rawFeatsData from "./feats.json";
import rawTraitsData from "./traits.json"

// region Race API
const racesArray = rawRacesData as unknown as Race[];
const raceDictionary: Record<string, Race> = {};
racesArray.forEach((r) => {
  raceDictionary[r.id] = r;
});

export const getRaceById = (id: string | null): Race | null => {
  if (!id) return null;
  return raceDictionary[id] || null;
};

export const getAllRaces = (): Race[] => {
  return racesArray;
};

// region Subrace API
const subracesArray = rawSubracesData as SubraceData[];
const subraceDictionary: Record<string, SubraceData> = {};
subracesArray.forEach((sr) => {
  subraceDictionary[sr.id] = sr;
});

export const getSubraceById = (id: string | null): SubraceData | null => {
  if (!id) return null;
  return subraceDictionary[id] || null;
};

export const getSubracesForRace = (raceId: string): SubraceData[] => {
  return subracesArray.filter((sr) => sr.parentRaceId === raceId);
};

// region Class API
const classesArray = rawClassesData as unknown as ClassData[];
const classDictionary: Record<string, ClassData> = {};
classesArray.forEach((c) => {
  classDictionary[c.id] = c;
});

export const getClassById = (id: string | null): ClassData | null => {
  if (!id) return null;
  return classDictionary[id] || null;
};

export const getAllClasses = (): ClassData[] => {
  return classesArray;
};

// region Subclass API
const subclassesArray = rawSubclassesData as unknown as SubclassData[];
const subclassDictionary: Record<string, SubclassData> = {};
subclassesArray.forEach((sc) => {
  subclassDictionary[sc.id] = sc;
});

export const getSubclassById = (id: string | null): SubclassData | null => {
  if (!id) return null;
  return subclassDictionary[id] || null;
};

export const getSubclassesForClass = (classId: string): SubclassData[] => {
  return subclassesArray.filter((sc) => sc.parentClassId === classId);
};

// region Items API
const itemsArray = rawItemsData as ItemData[];
const itemsDictionary: Record<string, ItemData> = {};
itemsArray.forEach((i) => {
  itemsDictionary[i.id] = i;
});

export const getItemById = (id: string | null): ItemData | null => {
  if (!id) return null;
  return itemsDictionary[id] || null;
};

export const getAllItems = (): ItemData[] => {
  return itemsArray;
};

// region Spells API
const spellsArray = rawSpellsData as SpellData[];
const spellsDictionary: Record<string, SpellData> = {};
spellsArray.forEach((s) => {
  spellsDictionary[s.id] = s;
});

export const getSpellByID = (id: string | null): SpellData | null => {
  if (!id) return null;
  return spellsDictionary[id] || null;
};

export const getAllSpells = (): SpellData[] => {
  return spellsArray;
};

// region Feats API
const featsArray = rawFeatsData as FeatData[];
const featDictionary: Record<string, FeatData> = {};
featsArray.forEach((feat) => {
  featDictionary[feat.id] = feat;
});

export const getFeatById = (id: string | null): FeatData | null => {
  if (!id) return null;
  return featDictionary[id] || null;
};

export const getFeatsByIds = (ids: string[]): FeatData[] => {
  return ids
    .map((id) => featDictionary[id])
    .filter((feat): feat is FeatData => feat !== undefined);
};

export const getAllFeats = (): FeatData[] => {
  return featsArray;
};

export const getFeatsByCategory = (
  category: FeatData["category"],
): FeatData[] => {
  return featsArray.filter((feat) => feat.category === category);
};

// region Traits API
const traitsArray = rawTraitsData as TraitData[];
const traitDictionary: Record<string, TraitData> = {};
traitsArray.forEach((t) => {
  traitDictionary[t.id] = t;
});

export const getTraitById = (id: string): TraitData | null => {
  return traitDictionary[id] || null;
};

export const getTraitsByIds = (ids: string[]): TraitData[] => {
  return ids.map(id => traitDictionary[id]).filter((t): t is TraitData => t !== undefined);
}

// Mock getter
// export const getTraitsByIds = (ids: string[]) => {
//   return ids.map(id => ({
//     id,
//     name: id.replace('trait_', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
//     lore: { shortDescription: "Trait description pending static data update." }
//   }));
// }
