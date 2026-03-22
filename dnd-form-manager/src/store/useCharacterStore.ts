import { create } from "zustand";
import type { Ability } from "../types/common";

interface CharacterState {
  name: string;
  raceId: string | null;
  subraceId: string | null;
  classId: string | null;
  level: number;

  // The raw numbers before racial bonuses or feats are applied
  baseAbilityScores: Record<Ability, number>;
  // Level up HP rolls
  hpRolls: Record<number, number>;
  chosenRacialBonuses: Partial<Record<Ability, number>>;
}

interface CharacterActions {
  setName: (name: string) => void;
  setRace: (raceId: string) => void;
  setSubrace: (subraceId: string | null) => void;
  setClass: (classId: string) => void;
  setLevel: (level: number) => void;
  setBaseAbilityScore: (ability: Ability, score: number) => void;
}

type CharacterStore = CharacterState & CharacterActions;

export const useCharacterStore = create<CharacterStore>((set) => ({
  name: "",
  raceId: null,
  subraceId: null,
  classId: null,
  level: 1,
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

  // --- Actions ---
  setName: (name) => set({ name }),

  setRace: (raceId) =>
    set({
      raceId,
      subraceId: null, // Reset subrace if the main race changes
    }),

  setSubrace: (subraceId) => set({ subraceId }),

  setClass: (classId) => set({ classId }),

  setLevel: (level) =>
    set({
      level: Math.max(1, Math.min(20, level)), // Constrain level between 1 and 20
    }),

  setBaseAbilityScore: (ability, score) =>
    set((state) => ({
      baseAbilityScores: {
        ...state.baseAbilityScores,
        [ability]: score,
      },
    })),
}));
