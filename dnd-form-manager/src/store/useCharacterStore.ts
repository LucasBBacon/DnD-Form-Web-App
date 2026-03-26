import { create } from "zustand";
import type { Ability, Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import { getClassById } from "../data/staticDataApi";

export interface InventoryRecord {
  itemId: string;
  quantity: number;
}

const clampAbilityScore = (score: number): number =>
  Math.max(1, Math.min(20, score));

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
  backgroundId: string | null;
  chosenRacialSkills: Skill[];
  chosenBackgroundSkills: Skill[];
  // Master record of everything chosen at each level
  choicesByLevel: Record<number, LevelChoice>;

  // region Spells state
  // IDs of spells permanently learned (Bards, Sorcerers, Warlocks...)
  spellsKnown: string[];
  // IDs of spells prepared today (Clerics, Druids, Wizards...)
  spellsPrepared: string[];

  // Maps spell level (1-9) to how many slots are USED
  expendedSpellSlots: Record<number, number>;
  // Warlocks are weird, track separately
  expendedPactSlots: number;

  // region Inventory State
  inventory: InventoryRecord[];
  equippedArmorId: string | null;
  equippedShieldId: string | null;
  equippedWeaponIds: string[];

  // region Combat State
  damageTaken: number;
  tempHp: number;
  deathSaves: { successes: number; failures: number };
  expendedHitDice: number;
}

interface CharacterActions {
  setName: (name: string) => void;
  setRace: (raceId: string) => void;
  setSubrace: (subraceId: string | null) => void;
  setClass: (classId: string) => void;
  setSubclass: (subclassId: string | null) => void;
  setBackground: (background: string) => void;

  setLevel: (level: number) => void;
  updateLevelChoice: (level: number, updates: Partial<LevelChoice>) => void;
  setBaseAbilityScore: (ability: Ability, score: number) => void;
  setBaseAbilityScores: (scores: Record<Ability, number>) => void;
  setRacialSkills: (skills: Skill[]) => void;
  setBackgroundSkills: (skills: Skill[]) => void;

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

  // Inventory Actions
  addInventoryItem: (itemId: string, quantity: number) => void;
  removeInventoryItem: (itemId: string, quantity: number) => void;
  equipArmor: (itemId: string | null) => void;
  equipShield: (itemId: string | null) => void;

  // Combat Actions
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  setTempHp: (amount: number) => void;
  recordDeathSave: (type: "successes" | "failures", value: boolean) => void;
  expendHitDie: () => void;
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
  backgroundId: null,
  chosenRacialSkills: [],
  chosenBackgroundSkills: [],
  choicesByLevel: {},
  spellsKnown: [],
  spellsPrepared: [],
  expendedSpellSlots: {},
  expendedPactSlots: 0,
  inventory: [
    { itemId: "item_backpack", quantity: 1 },
    { itemId: "item_torch", quantity: 10 },
  ],
  equippedArmorId: null,
  equippedShieldId: null,
  equippedWeaponIds: [],
  damageTaken: 0,
  tempHp: 0,
  deathSaves: { successes: 0, failures: 0 },
  expendedHitDice: 0,

  // --- Actions ---
  setName: (name) => set({ name }),

  setLevel: (newLevel) =>
    set((state) => {
      // If leveled DOWN, should theoretically clear choices for levels lost to prevent ghost stats from applying
      const clampedLevel = Math.max(1, Math.min(20, newLevel));

      let updatedSubclassId = state.subclassId;

      if (state.classId && updatedSubclassId) {
        const currentClass = getClassById(state.classId);
        if (
          currentClass &&
          clampedLevel < currentClass.subclass_info.choice_level
        ) {
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
      chosenRacialSkills: [], // Race skill pool changes, previous picks are invalid
    }),

  setSubrace: (subraceId) => set({ subraceId }),

  setClass: (classId) => set({ classId }),

  setSubclass: (subclassId) => set({ subclassId }),

  setBackground: (backgroundId) =>
    set({
      backgroundId,
      chosenBackgroundSkills: [], // Background skill pool changes, previous picks are invalid
    }),

  setBaseAbilityScore: (ability, score) =>
    set((state) => ({
      baseAbilityScores: {
        ...state.baseAbilityScores,
        [ability]: clampAbilityScore(score),
      },
    })),

  setBaseAbilityScores: (scores) =>
    set((state) => {
      const nextScores = { ...state.baseAbilityScores };

      (Object.keys(scores) as Ability[]).forEach((ability) => {
        const incoming = scores[ability];
        if (typeof incoming === "number" && Number.isFinite(incoming)) {
          nextScores[ability] = clampAbilityScore(incoming);
        }
      });

      return {
        baseAbilityScores: nextScores,
      };
    }),

  setRacialSkills: (skills) => set({ chosenRacialSkills: skills }),
  setBackgroundSkills: (skills) => set({ chosenBackgroundSkills: skills }),

  // region Spell Actions

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

  // endregion

  // region Combat Actions

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

  // endregion

  // region Rest Actions

  takeLongRest: () =>
    set((state) => ({
      expendedSpellSlots: {}, // Wipes all normal slot usage
      expendedPactSlots: 0, // Wipes pact slot usage
      damageTaken: 0, // fully heal
      tempHp: 0, // temp HP stops after long rest
      // 5e rule: regain half total hit dice (min 1)
      expendedHitDice: Math.max(
        0,
        state.expendedHitDice - Math.max(1, Math.floor(state.level / 2)),
      ),
    })),

  takeShortRest: () =>
    set(() => ({
      expendedPactSlots: 0, // Warlocks get spell slots back after short rest
      // Normal spell slots remain untouched
    })),

  // endregion

  // region Inventory Actions
  addInventoryItem: (itemId, quantity) =>
    set((state) => {
      const existing = state.inventory.find((i) => i.itemId === itemId);
      if (existing) {
        return {
          inventory: state.inventory.map((i) =>
            i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        };
      }
      return { inventory: [...state.inventory, { itemId, quantity }] };
    }),

  removeInventoryItem: (itemId, quantity) =>
    set((state) => {
      // Logic to subtract quantity
      const updatedInventory = state.inventory
        .map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i,
        )
        .filter((i) => i.quantity > 0);

      // Check if the item was completely removed
      const isItemFullyRemoved = !updatedInventory.some(
        (i) => i.itemId === itemId,
      );
      return {
        inventory: updatedInventory,
        // Strip the ID if they just dropped equipped gear
        equippedArmorId:
          isItemFullyRemoved && state.equippedArmorId === itemId
            ? null
            : state.equippedArmorId,
        equippedShieldId:
          isItemFullyRemoved && state.equippedShieldId === itemId
            ? null
            : state.equippedShieldId,
      };
    }),

  equipArmor: (itemId) => set({ equippedArmorId: itemId }),

  equipShield: (itemId) => set({ equippedShieldId: itemId }),

  // endregion

  takeDamage: (amount) =>
    set((state) => {
      let remainingDamage = amount;
      let newTempHp = state.tempHp;

      // Temp HP absorbs damage first
      if (newTempHp > 0) {
        if (newTempHp >= remainingDamage) {
          newTempHp -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= newTempHp;
          newTempHp = 0;
        }
      }

      return {
        tempHp: newTempHp,
        damageTaken: state.damageTaken + remainingDamage,
      };
    }),

  heal: (amount) =>
    set((state) => ({
      // Cannot have negative damage take (cannot heal above max HP)
      damageTaken: Math.max(0, state.damageTaken - amount),
      // 5e rule: regaining any HP resets death saves
      deathSaves: { successes: 0, failures: 0 },
    })),

  setTempHp: (amount) =>
    set((state) => ({
      // 5e rule: temp hp does not stack, choose higher value
      tempHp: Math.max(state.tempHp, amount),
    })),

  recordDeathSave: (type, value) =>
    set((state) => {
      const current = state.deathSaves[type];
      return {
        deathSaves: {
          ...state.deathSaves,
          // add or subtract depending on the checkbox toggle
          [type]: value ? Math.min(3, current + 1) : Math.max(0, current - 1),
        },
      };
    }),

  expendHitDie: () =>
    set((state) => ({
      expendedHitDice: state.expendedHitDice + 1,
    })),
}));
