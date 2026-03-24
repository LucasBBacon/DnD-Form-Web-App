import { create } from "zustand";
import type { Ability } from "../types/common";
import type { LevelChoice } from "../types/progression";
import { getClassById } from "../data/staticDataApi";

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

  // IDs of spells permanently learned (Bards, Sorcerers, Warlocks...)
  spellsKnown: string[];
  // IDs of spells prepared today (Clerics, Druids, Wizards...)
  spellsPrepared: string[];

  // Maps spell level (1-9) to how many slots are USED
  expendedSpellSlots: Record<number, number>;
  // Warlocks are weird, track separately
  expendedPactSlots: number;
}

interface CharacterActions {
  setName: (name: string) => void;
  setRace: (raceId: string) => void;
  setSubrace: (subraceId: string | null) => void;
  setClass: (classId: string) => void;
  setSubclass: (subclassId: string) => void;

  setLevel: (level: number) => void;
  updateLevelChoice: (level: number, updates: Partial<LevelChoice>) => void;
  setBaseAbilityScore: (ability: Ability, score: number) => void;

  learnSpell: (spellId: string) => void;
  prepareSpell: (spellId: string) => void;
  unprepareSpell: (spellId: string) => void;

  // Combat Actions
  expendSpellSlot: (level: number) => void;
  restoreSpellSlot: (level: number) => void;
  expendPactSlot: () => void;

  // Resting Actions
  takeLongRest: () => void;
  takeShortRest: () => void;
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
  spellsKnown: [],
  spellsPrepared: [],
  expendedSpellSlots: {},
  expendedPactSlots: 0,

  // --- Actions ---
  setName: (name) => set({ name }),

  setLevel: (newLevel) =>
    set((state) => {
      // If leveled DOWN, should theoretically clear choices for levels lost to prevent ghost stats from applying
      const clampedLevel = Math.max(1, Math.min(20, newLevel));

      let updatedSubclassId = state.subclassId;

      if (state.classId && updatedSubclassId) {
        // TODO import getClassById properly to check
        const currentClass = getClassById(state.classId);
        if (currentClass && clampedLevel < currentClass.subclass_info.choice_level) {
          updatedSubclassId = null;
        }
      }

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
        subclassId: updatedSubclassId,
        // (Wire up the exact level check in derivation engine)
      };
    }),

  // Action to save a specific choice made at a specific level
  updateLevelChoice: (level, updates) =>
    set((state) => ({
      choicesByLevel: {
        ...state.choicesByLevel,
        [level]: {
          ...(state.choicesByLevel[level] || {}),
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

  learnSpell: (spellId) =>
    set((state) => {
      if (!spellId || state.spellsKnown.includes(spellId)) {
        return state;
      }

      return {
        spellsKnown: [...state.spellsKnown, spellId],
      };
    }),

  prepareSpell: (spellId) =>
    set((state) => {
      if (!spellId || state.spellsPrepared.includes(spellId)) {
        return state;
      }

      return {
        spellsPrepared: [...state.spellsPrepared, spellId],
      };
    }),

  unprepareSpell: (spellId) =>
    set((state) => ({
      spellsPrepared: state.spellsPrepared.filter((id) => id !== spellId),
    })),

  expendSpellSlot: (level) =>
    set((state) => {
      if (!Number.isInteger(level) || level < 1 || level > 9) {
        return state;
      }

      const currentUsed = state.expendedSpellSlots[level] ?? 0;
      return {
        expendedSpellSlots: {
          ...state.expendedSpellSlots,
          [level]: currentUsed + 1,
        },
      };
    }),

  restoreSpellSlot: (level) =>
    set((state) => {
      if (!Number.isInteger(level) || level < 1 || level > 9) {
        return state;
      }

      const currentUsed = state.expendedSpellSlots[level] ?? 0;
      if (currentUsed <= 0) {
        return state;
      }

      const updated = {
        ...state.expendedSpellSlots,
        [level]: currentUsed - 1,
      };

      if (updated[level] === 0) {
        delete updated[level];
      }

      return {
        expendedSpellSlots: updated,
      };
    }),

  expendPactSlot: () =>
    set((state) => ({
      expendedPactSlots: state.expendedPactSlots + 1,
    })),

  takeLongRest: () =>
    set(() => ({
      expendedSpellSlots: {}, // Wipes all normal slot usage
      expendedPactSlots: 0, // Wipes pact slot usage
      // TODO: Reset HP to max HP, reset Hit Dice
    })),

  takeShortRest: () =>
    set(() => ({
      expendedPactSlots: 0, // Warlocks get spell slots back after short rest
      // Normal spell slots remain untouched
    })),
}));
