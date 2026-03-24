import type { ClassData } from "../types/class";
import type { Race } from "../types/race";
import type { SubclassData } from "../types/subclass";
import type { ItemData } from "../types/item";

import rawClassesData from "./classes.json";
import rawSubclassesData from "./subclasses.json";
import rawRacesData from "./races.json";
import rawItemsData from "./items.json";

const racesArray = rawRacesData as Race[];
const classesArray = rawClassesData as ClassData[];
const subclassesArray = rawSubclassesData as SubclassData[];
const itemsArray = rawItemsData as ItemData[];

// Create lookup dictionaries for O(1) access
// region Dictionaries
const classDictionary: Record<string, ClassData> = {};
classesArray.forEach((c) => {
  classDictionary[c.id] = c;
});

const subclassDictionary: Record<string, SubclassData> = {};
subclassesArray.forEach((sc) => {
  subclassDictionary[sc.id] = sc;
});

const raceDictionary: Record<string, Race> = {};
racesArray.forEach((r) => {
  raceDictionary[r.id] = r;
});

const itemsDictionary: Record<string, ItemData> = {};
itemsArray.forEach((i) => {
  itemsDictionary[i.id] = i;
});

// Export Getter funcs for single items
// region Getters
export const getClassById = (id: string | null): ClassData | null => {
  if (!id) return null;
  return classDictionary[id] || null;
};

export const getSubclassById = (id: string | null): SubclassData | null => {
  if (!id) return null;
  return subclassDictionary[id] || null;
};

export const getRaceById = (id: string | null): Race | null => {
  if (!id) return null;
  return raceDictionary[id] || null;
};

export const getItemById = (id: string | null): ItemData | null => {
  if (!id) return null;
  return itemsDictionary[id] || null;
};

// Export funcs to get lists
export const getAllClasses = (): ClassData[] => {
  return classesArray;
};

export const getAllRaces = (): Race[] => {
  return racesArray;
};

export const getSubclassesForClass = (classId: string): SubclassData[] => {
  return subclassesArray.filter((sc) => sc.parent_class_id === classId);
};

export const getAllItems = (): ItemData[] => {
  return itemsArray;
};
