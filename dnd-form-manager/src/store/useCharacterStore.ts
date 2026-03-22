import { create } from "zustand";
import type { Ability } from "../types/common";
import type { LevelChoice } from "../types/progression";

interface CharacterState {
  name: string;
  level: number;
  raceId: string | null;
  subraceId: string | null;
  classId: string | null;
  subclassId: string | null;

  // The raw numbers before racial bonuses or feats are applied
  baseAbilityScores: Record<Ability, number>;
  // Level up HP rolls
  hpRolls: Record<number, number>;
  chosenRacialBonuses: Partial<Record<Ability, number>>;
  // Master record of everything chosen at each level
  choicesByLevel: Record<number, LevelChoice>;
}

interface CharacterActions {
  setName: (name: string) => void;
  setRace: (raceId: string) => void;
  setSubrace: (subraceId: string | null) => void;
  setClass: (classId: string) => void;
  setSubclass: (subclassId: string) => void;
  setLevel: (level: number) => void;
  setBaseAbilityScore: (ability: Ability, score: number) => void;
}

type CharacterStore = CharacterState & CharacterActions;

export const useCharacterStore = create<CharacterStore>((set) => ({
  name: "",
  level: 1,
  raceId: null,
  subraceId: null,
  classId: null,
  subclassId: null,
  baseAbilityScores: {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  },
  hpRolls: {},
  chosenRacialBonuses: {},
  choicesByLevel: {},

  // --- Actions ---
  setName: (name) => set({ name }),

  setLevel: (newLevel) =>
    set((state) => {
      // If leveled DOWN, should theoretically clear choices for levels lost to prevent ghost stats from applying
      const clampedLevel = Math.max(1, Math.min(20, newLevel));

      // Clean up feature choices if de-leveling
      const updatedChoices = { ...state.choicesByLevel };
      Object.keys(updatedChoices).forEach((key) => {
        if (Number(key) > clampedLevel) {
          delete updatedChoices[Number(key)];
        }
      });

      return {
        level: clampedLevel,
        choicesByLevel: updatedChoices,
        // If de-leveing below the subclass requirement, clear subclass
        // (Wire up the exact level check in derrivation engine)
      };
    }),

  // Action to save a specific choice made at a specific level
  updateLevelChoice: (level: number, updates: Partial<LevelChoice>) =>
    set((state) => ({
      choicesByLevel: {
        ...state.choicesByLevel,
        [level]: {
          ...state.choicesByLevel[level],
          ...updates,
        },
      },
    })),

  setRace: (raceId) =>
    set({
      raceId,
      subraceId: null, // Reset subrace if the main race changes
    }),

  setSubrace: (subraceId) => set({ subraceId }),

  setClass: (classId) => set({ classId }),

  setSubclass: (subclassId) => set({ subclassId }),

  setBaseAbilityScore: (ability, score) =>
    set((state) => ({
      baseAbilityScores: {
        ...state.baseAbilityScores,
        [ability]: score,
      },
    })),
}));
