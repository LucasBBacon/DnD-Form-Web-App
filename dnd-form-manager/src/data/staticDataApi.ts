import type { ClassData } from "../types/class";
import type { Race } from "../types/race";
import type { SubclassData } from "../types/subclass";

import rawClassesData from "./classes.json";
import rawSubclassesData from "./subclasses.json"
import rawRacesData from "./races.json";

const racesArray = rawRacesData as Race[];
const classesArray = rawClassesData as ClassData[];
const subclassesArray = rawSubclassesData as SubclassData[];

// Create lookup dictionaries for O(1) access
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

// Export Getter funcs for single items
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

// Export funcs to get lists
export const getAllClasses = (): ClassData[] => {
  return classesArray;
};

export const getAllRaces = (): Race[] => {
  return racesArray;
};

export const getSubclassesForClass = (classId: string): SubclassData[] => {
  return subclassesArray.filter(sc => sc.parent_class_id === classId);
};
