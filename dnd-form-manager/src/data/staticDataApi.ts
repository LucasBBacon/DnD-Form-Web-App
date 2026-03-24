import type { ClassData } from "../types/class";
import type { Race } from "../types/race";
import type { SubclassData } from "../types/subclass";
import type { ItemData } from "../types/item";
import type { SpellData } from "../types/spell";

import rawClassesData from "./classes.json";
import rawSubclassesData from "./subclasses.json";
import rawRacesData from "./races.json";
import rawItemsData from "./items.json";
import rawSpellsData from "./spells.json";

// region Race API
const racesArray = rawRacesData as Race[];
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

// region Class API
const classesArray = rawClassesData as ClassData[];
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
const subclassesArray = rawSubclassesData as SubclassData[];
const subclassDictionary: Record<string, SubclassData> = {};
subclassesArray.forEach((sc) => {
  subclassDictionary[sc.id] = sc;
});

export const getSubclassById = (id: string | null): SubclassData | null => {
  if (!id) return null;
  return subclassDictionary[id] || null;
};

export const getSubclassesForClass = (classId: string): SubclassData[] => {
  return subclassesArray.filter((sc) => sc.parent_class_id === classId);
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
}

export const getAllSpells = () : SpellData[] => {
  return spellsArray;
}
