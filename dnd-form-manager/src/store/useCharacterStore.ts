import { create } from "zustand";
import type { Ability, Skill } from "../types/common";
import type { FeatAcquisitionEntry } from "../types/feat";
import type { LevelChoice } from "../types/progression";
import { getClassById } from "../data/staticDataApi";

export interface InventoryRecord {
  itemId: string;
  quantity: number;
}

// #region --- Helper Functions ---

const clampAbilityScore = (score: number): number =>
  Math.max(1, Math.min(20, score));

const clampCharacterLevel = (level: number): number =>
  Math.max(1, Math.min(20, level));

export interface CharacterClassTrack {
  classId: string;
  subclassId: string | null;
  level: number;
}

const sanitizeClassTracks = (
  tracks: CharacterClassTrack[],
): CharacterClassTrack[] =>
  tracks
    .filter((track) => track.classId && track.level > 0)
    .map((track) => ({
      classId: track.classId,
      subclassId: track.subclassId ?? null,
      level: Math.max(1, Math.floor(track.level)),
    }));

const getTotalClassTrackLevels = (tracks: CharacterClassTrack[]): number =>
  tracks.reduce((total, track) => total + track.level, 0);

const upsertClassTrack = (
  tracks: CharacterClassTrack[],
  classId: string,
  updates: Partial<CharacterClassTrack>,
): CharacterClassTrack[] => {
  const existingIndex = tracks.findIndex((track) => track.classId === classId);

  if (existingIndex === -1) {
    const baseLevel = Math.max(1, Math.floor(updates.level ?? 1));
    return [
      ...tracks,
      {
        classId,
        subclassId: updates.subclassId ?? null,
        level: baseLevel,
      },
    ];
  }

  return tracks.map((track) =>
    track.classId !== classId
      ? track
      : {
          ...track,
          ...updates,
          subclassId: updates.subclassId ?? track.subclassId,
          level: Math.max(1, Math.floor(updates.level ?? track.level)),
        },
  );
};

// #endregion

// #region --- Store Types ---
interface CharacterState {
  // #region --- Core Character State ---

  name: string;
  level: number;
  raceId: string | null;
  subraceId: string | null;
  classId: string | null;
  subclassId: string | null;
  classTracks: CharacterClassTrack[];

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
  acquiredFeats: FeatAcquisitionEntry[];

  // #endregion

  // #region --- Spells State ---

  // IDs of spells permanently learned (Bards, Sorcerers, Warlocks...)
  spellsKnown: string[];
  // IDs of spells prepared today (Clerics, Druids, Wizards...)
  spellsPrepared: string[];
  // Maps spell level (1-9) to how many slots are USED
  expendedSpellSlots: Record<number, number>;
  // Warlocks are weird, track separately
  expendedPactSlots: number;

  // #endregion

  // #region --- Inventory State ---

  inventory: InventoryRecord[];
  equippedArmorId: string | null;
  equippedShieldId: string | null;
  equippedWeaponIds: string[];

  // #endregion

  // #region --- Combat State ---

  damageTaken: number;
  tempHp: number;
  deathSaves: { successes: number; failures: number };
  expendedHitDice: number;

  isSetupComplete: boolean;

  // #endregion
}

interface CharacterActions {
  // #region --- Character Setup Actions ---

  /**
   * Sets the name of the character.
   * @param name - The new name for the character.
   * @returns void
   */
  setName: (name: string) => void;
  /**
   * Sets the race of the character.
   * @param raceId - The ID of the new race for the character.
   * @returns void
   */
  setRace: (raceId: string) => void;
  /**
   * Sets the subrace of the character.
   * @param subraceId - The ID of the new subrace for the character, or null to remove it.
   * @returns void
   */
  setSubrace: (subraceId: string | null) => void;
  /**
   * Sets the class of the character.
   * @param classId - The ID of the new class for the character.
   * @returns void
   */
  setClass: (classId: string) => void;
  /**
   * Sets the subclass of the character.
   * @param subclassId - The ID of the new subclass for the character, or null to remove it.
   * @returns void
   */
  setSubclass: (subclassId: string | null) => void;

  // #region --- Multi-Classing Actions ---

  /**
   * Sets the class tracks of the character.
   * @param tracks - An array of CharacterClassTrack objects representing the new class tracks for the character.
   * @returns void
   */
  setClassTracks: (tracks: CharacterClassTrack[]) => void;
  /**
   * Adds a new class track to the character.
   * @param classId - The ID of the class to add.
   * @param startingLevel - The starting level for the new class track (optional).
   * @returns void
   */
  addClassTrack: (classId: string, startingLevel?: number) => void;
  /**
   * Removes a class track from the character.
   * @param classId - The ID of the class track to remove.
   * @returns void
   */
  removeClassTrack: (classId: string) => void;
  /**
   * Sets the level of a specific class track.
   * @param classId - The ID of the class track to update.
   * @param level - The new level for the class track.
   * @returns void
   */
  setClassTrackLevel: (classId: string, level: number) => void;
  /**
   * Sets the subclass of a specific class track.
   * @param classId - The ID of the class track to update.
   * @param subclassId - The ID of the new subclass for the class track, or null to remove it.
   * @returns void
   */
  setClassTrackSubclass: (classId: string, subclassId: string | null) => void;

  // #endregion

  // #region --- Background and Ability Actions ---

  /**
   * Sets the background of the character.
   * @param background - The ID of the new background for the character.
   * @returns void
   */
  setBackground: (background: string) => void;
  /**
   * Sets the level of the character.
   * @param level - The new level for the character.
   * @returns void
   */
  setLevel: (level: number) => void;
  /**
   * Updates the choices for a specific level.
   * @param level - The level to update.
   * @param updates - Partial updates to apply to the level's choices.
   * @returns void
   */
  updateLevelChoice: (level: number, updates: Partial<LevelChoice>) => void;
  /**
   * Sets the base ability score for a specific ability.
   * @param ability - The ability to update.
   * @param score - The new score for the ability.
   * @returns void
   */
  setBaseAbilityScore: (ability: Ability, score: number) => void;
  /**
   * Sets the base ability scores for the character.
   * @param scores - An object mapping abilities to their new scores.
   * @returns void
   */
  setBaseAbilityScores: (scores: Record<Ability, number>) => void;
  /**
   * Sets the racial skills for the character.
   * @param skills - An array of Skill objects representing the new racial skills for the character.
   * @returns void
   */
  setRacialSkills: (skills: Skill[]) => void;
  /**
   * Sets the chosen racial bonuses for the character.
   * @param bonuses - An object mapping abilities to their chosen racial bonuses.
   * @returns void
   */
  setChosenRacialBonuses: (bonuses: Partial<Record<Ability, number>>) => void;
  /**
   * Sets the background skills for the character.
   * @param skills - An array of Skill objects representing the new background skills for the character.
   * @returns void
   */
  setBackgroundSkills: (skills: Skill[]) => void;
  /**
   * Sets the origin feat for the character.
   * @param featId - The ID of the new origin feat for the character, or null to remove it.
   * @returns void
   */
  setOriginFeat: (featId: string | null) => void;

  // #endregion

  // #endregion

  // #region --- Spell Actions ---

  /**
   * Adds a spell to the character's known spells list.
   * @param spellId - The ID of the spell to add.
   * @returns void
   */
  learnSpell: (spellId: string) => void;
  /**
   * Prepares a spell for the character.
   * @param spellId - The ID of the spell to prepare.
   * @returns void
   */
  prepareSpell: (spellId: string) => void;
  /**
   * Unprepares a spell for the character.
   * @param spellId - The ID of the spell to unprepare.
   * @returns void
   */
  unprepareSpell: (spellId: string) => void;

  // #endregion

  // #region --- Combat Actions ---

  /**
   * Expends a spell slot of a given level for the character.
   * @param level - The level of the spell slot to expend.
   * @returns void
   */
  expendSpellSlot: (level: number) => void;
  /**
   * Restores a spell slot of a given level for the character.
   * @param level - The level of the spell slot to restore.
   * @returns void
   */
  restoreSpellSlot: (level: number) => void;
  /**
   * Expends a pact spell slot for the character.
   * @returns void
   */
  expendPactSlot: () => void;

  // #endregion

  // #region --- Resting Actions ---

  /**
   * Handles the character taking a long rest, which restores spell slots, heals the character, and regains hit dice.
   * @returns void
   */
  takeLongRest: () => void;
  /**
   * Handles the character taking a short rest, which allows them to spend hit dice to regain health.
   * @returns void
   */
  takeShortRest: () => void;

  // #endregion

  // #region --- Inventory Actions ---

  /**
   * Adds an item to the character's inventory.
   * @param itemId - The ID of the item to add.
   * @param quantity - The quantity of the item to add.
   * @returns void
   */
  addInventoryItem: (itemId: string, quantity: number) => void;
  /**
   * Removes an item from the character's inventory.
   * @param itemId - The ID of the item to remove.
   * @param quantity - The quantity of the item to remove.
   * @returns void
   */
  removeInventoryItem: (itemId: string, quantity: number) => void;
  /**
   * Equips an armor item for the character.
   * @param itemId - The ID of the armor item to equip, or null to unequip.
   * @returns void
   */
  equipArmor: (itemId: string | null) => void;
  /**
   * Equips a shield item for the character.
   * @param itemId - The ID of the shield item to equip, or null to unequip.
   * @returns void
   */
  equipShield: (itemId: string | null) => void;

  // #endregion

  // #region --- Combat Actions ---

  /**
   * Applies damage to the character, reducing their current hit points.
   * @param amount - The amount of damage to apply.
   * @returns void
   */
  takeDamage: (amount: number) => void;
  /**
   * Heals the character, increasing their current hit points.
   * @param amount - The amount of healing to apply.
   * @returns void
   */
  heal: (amount: number) => void;
  /**
   * Sets the temporary hit points for the character.
   * @param amount - The amount of temporary hit points to set.
   * @returns void
   */
  setTempHp: (amount: number) => void;
  /**
   * Records a death saving throw for the character.
   * @param type - The type of death save ("successes" or "failures").
   * @param value - The value to record (true for success, false for failure).
   * @returns void
   */
  recordDeathSave: (type: "successes" | "failures", value: boolean) => void;
  /**
   * Expends a hit die for the character.
   * @returns void
   */
  expendHitDie: () => void;

  // #endregion

  // #region --- Character Saving Actions ---

  /**
   * Marks the character's setup as complete.
   * @returns void
   */
  completeSetup: () => void;
  /**
   * Resets the character to its initial state.
   * @returns void
   */
  resetCharacter: () => void;

  // #endregion
}

type CharacterStore = CharacterState & CharacterActions;

// #endregion

/**
 * Zustand store for managing the state of a D&D character, including core character info, spells, inventory, and combat status.
 * Provides actions for updating character details, managing spells, handling inventory changes,
 * and tracking combat-related information like damage and death saves.
 */
export const useCharacterStore = create<CharacterStore>((set) => ({
  // #region --- Initial State ---

  name: "",
  level: 1,
  raceId: null,
  subraceId: null,
  classId: null,
  subclassId: null,
  classTracks: [],
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
  acquiredFeats: [],
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

  isSetupComplete: false,

  // #endregion

  // #region --- Setup Actions ---

  setName: (name) => set({ name }),

  setLevel: (newLevel) =>
    set((state) => {
      // If leveled DOWN, should theoretically clear choices for levels lost to prevent ghost stats from applying
      const clampedLevel = clampCharacterLevel(newLevel);

      // If the character has a class and the new level is below the subclass choice level, remove the subclass
      let updatedSubclassId = state.subclassId;
      if (state.classId && updatedSubclassId) {
        const currentClass = getClassById(state.classId);
        if (
          currentClass &&
          clampedLevel < currentClass.subclassInfo.choiceLevel
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

      // Remove any feats acquired through level up that are now above the new level
      const updatedAcquiredFeats = state.acquiredFeats.filter((entry) => {
        if (entry.source !== "level_up") return true;
        return (entry.sourceLevel ?? 0) <= clampedLevel;
      });

      // If the character has only one class track and its level is now above the new total level, adjust it down to match
      const updatedClassTracks =
        state.classTracks.length === 1 &&
        state.classId === state.classTracks[0].classId
          ? upsertClassTrack(state.classTracks, state.classTracks[0].classId, {
              level: clampedLevel,
            })
          : state.classTracks;

      return {
        level: clampedLevel,
        choicesByLevel: updatedChoices,
        acquiredFeats: updatedAcquiredFeats,
        subclassId: updatedSubclassId,
        classTracks: updatedClassTracks,
      };
    }),

  updateLevelChoice: (level, updates) =>
    set((state) => {
      // Update the choices for the specified level with the provided updates, merging with existing choices if present
      const nextChoicesByLevel = {
        ...state.choicesByLevel,
        [level]: {
          ...(state.choicesByLevel[level] || {}),
          ...updates,
        },
      };

      // If a feat choice is being updated, we need to update the acquired feats list accordingly
      const nextAcquiredFeats = state.acquiredFeats.filter(
        (entry) =>
          !(entry.source === "level_up" && entry.sourceLevel === level),
      );

      // If a new feat is being added at this level, add it to the acquired feats list with the appropriate source and level information
      if (Object.prototype.hasOwnProperty.call(updates, "featId")) {
        const levelFeatId = updates.featId;
        if (typeof levelFeatId === "string" && levelFeatId.trim().length > 0) {
          nextAcquiredFeats.push({
            featId: levelFeatId,
            source: "level_up",
            sourceLevel: level,
          });
        }
      }

      return {
        choicesByLevel: nextChoicesByLevel,
        acquiredFeats: nextAcquiredFeats,
      };
    }),

  setRace: (raceId) =>
    set((state) => ({
      raceId,
      subraceId: null, // Reset subrace if the main race changes
      chosenRacialSkills: [], // Race skill pool changes, previous picks are invalid
      acquiredFeats: state.acquiredFeats.filter(
        (entry) => entry.source !== "origin", // Remove any origin feats since those are tied to the race
      ),
    })),

  setSubrace: (subraceId) =>
    set((state) => ({
      subraceId,
      acquiredFeats: state.acquiredFeats.filter(
        (entry) => entry.source !== "origin", // Remove any origin feats since those are tied to the subrace
      ),
    })),

  setClass: (classId) =>
    set((state) => ({
      classId,
      classTracks: upsertClassTrack(state.classTracks, classId, {
        subclassId: null, // Reset subclass when changing class
        level: state.level, // Default new class track to the character's current level, will be clamped in the reducer
      }),
      acquiredFeats: state.acquiredFeats.filter(
        (entry) => entry.source !== "origin", // Remove any origin feats since those are tied to the class
      ),
    })),

  setSubclass: (subclassId) =>
    set((state) => ({
      subclassId,
      classTracks: state.classId
        ? upsertClassTrack(state.classTracks, state.classId, { subclassId })
        : state.classTracks, // If there's no class, we can't associate the subclass with a track, so just update the state and rely on the UI to handle this edge case <- TODO: Maybe should just prevent setting a subclass if there's no class?
      acquiredFeats: state.acquiredFeats.filter(
        (entry) => entry.source !== "origin", // Remove any origin feats since those are tied to the subclass
      ),
    })),

  // #region --- Setup Multi-Classing Actions ---

  setClassTracks: (tracks) =>
    set((state) => {
      // Sanitize the incoming tracks to ensure they are valid and consistent, 
      // then determine the primary track and total level for the character based on the sanitized tracks
      const sanitizedTracks = sanitizeClassTracks(tracks);
      const primaryTrack = sanitizedTracks[0] || null;
      const totalLevel =
        sanitizedTracks.length > 0
          ? clampCharacterLevel(getTotalClassTrackLevels(sanitizedTracks))
          : state.level;

      return {
        classTracks: sanitizedTracks,
        classId: primaryTrack?.classId ?? state.classId,
        subclassId: primaryTrack?.subclassId ?? state.subclassId,
        level: totalLevel,
      };
    }),

  addClassTrack: (classId, startingLevel = 1) =>
    set((state) => {
      // Add a new class track for the specified class ID, defaulting to the character's current level or 1 if not provided, 
      // then determine the primary track and total level for the character based on the updated tracks
      const nextTracks = upsertClassTrack(state.classTracks, classId, {
        level: Math.max(1, Math.floor(startingLevel)),
      });
      const primaryTrack = nextTracks[0] || null;

      return {
        classTracks: nextTracks,
        classId: state.classId ?? primaryTrack?.classId ?? null,
        subclassId:
          state.classId === null
            ? (primaryTrack?.subclassId ?? null)
            : state.subclassId,
        level: clampCharacterLevel(getTotalClassTrackLevels(nextTracks)),
      };
    }),

  removeClassTrack: (classId) =>
    set((state) => {
      const nextTracks = state.classTracks.filter(
        (track) => track.classId !== classId,
      );
      const primaryTrack = nextTracks[0] || null;

      return {
        classTracks: nextTracks,
        classId:
          state.classId === classId
            ? (primaryTrack?.classId ?? null)
            : state.classId,
        subclassId:
          state.classId === classId
            ? (primaryTrack?.subclassId ?? null)
            : state.subclassId,
        level:
          nextTracks.length > 0
            ? clampCharacterLevel(getTotalClassTrackLevels(nextTracks))
            : 1,
      };
    }),

  setClassTrackLevel: (classId, level) =>
    set((state) => {
      const classTrackLevel = Math.max(1, Math.floor(level));
      const nextTracks = upsertClassTrack(state.classTracks, classId, {
        level: classTrackLevel,
      });

      return {
        classTracks: nextTracks,
        level: clampCharacterLevel(getTotalClassTrackLevels(nextTracks)),
      };
    }),

  setClassTrackSubclass: (classId, subclassId) =>
    set((state) => ({
      classTracks: upsertClassTrack(state.classTracks, classId, {
        subclassId,
      }),
      classId: state.classId ?? classId,
      subclassId:
        state.classId === classId || state.classId === null
          ? subclassId
          : state.subclassId,
    })),

  // #endregion

  // #region --- Setup Background and Ability Actions ---

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

  setChosenRacialBonuses: (bonuses) => set({ chosenRacialBonuses: bonuses }),

  setBackgroundSkills: (skills) => set({ chosenBackgroundSkills: skills }),

  setOriginFeat: (featId) =>
    set((state) => {
      const filtered = state.acquiredFeats.filter(
        (entry) => entry.source !== "origin",
      );

      if (!featId) {
        return { acquiredFeats: filtered };
      }

      return {
        acquiredFeats: [
          ...filtered,
          {
            featId,
            source: "origin",
            sourceLevel: 1,
          },
        ],
      };
    }),

  // #endregion

  // #region --- Spell Actions ---

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

  // #endregion

  // #region --- Combat Actions ---

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

  // #endregion

  // #region --- Rest Actions ---

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

  // #endregion

  // #region --- Inventory Actions ---

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

  // #endregion

  // #region --- Combat Actions ---

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

  // #endregion

  // #region --- Character Saving Actions ---

  completeSetup: () => set({ isSetupComplete: true }),

  resetCharacter: () =>
    set({
      isSetupComplete: false,
      name: "",
      level: 1,
      raceId: null,
      subraceId: null,
      classId: null,
      subclassId: null,
      classTracks: [],
      inventory: [],
      choicesByLevel: {},
      acquiredFeats: [],
    }),

  // #endregion
}));
