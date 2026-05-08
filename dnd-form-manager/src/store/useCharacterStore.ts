import { create } from "zustand";
import type { Ability, Skill, UUID } from "../types/common";
import type { FeatAcquisitionEntry } from "../types/feat";
import type { ItemData, ItemInstanceData } from "../types/item";
import type { LevelUpDraft } from "../types/levelUpDraft";
import type { LevelChoice, LevelUpMode } from "../types/progression";
import { getClassById, getItemById } from "../data/staticDataApi";
import { generateUuidV4 } from "../utils/uuidUtils";
import type {
  AbilityAssignmentMethod,
  RollingInputMode,
  VirtualAbilityRoll,
} from "../utils/abilityAssignmentUtils";

// #region --- Types and Interfaces ---

/** 
 * CharacterClassTrack represents a single class track for a character, used to manage multi-classing by tracking the class ID, optional subclass ID, and level for each class track the character has.
 * This allows for flexible multi-classing support while maintaining clear associations between classes and their respective levels and subclasses.
 */
export interface CharacterClassTrack {
  classId: string;
  subclassId: string | null;
  level: number;
}

export type RestType = "short" | "long";

/** 
 * Inventory types used for managing the character's inventory state, including stack-based and instance-based items
 */
export interface InventoryStackRecord {
  //  Unique identifier for this stack of items, used for tracking and updating specific stacks in the inventory
  stackId: UUID;
  // The ID of the base item that this stack represents, used to look up item details and properties from static data
  baseItemId: string;
  // The quantity of items in this stack, used for stackable items like consumables or ammunition; should be a positive integer
  quantity: number;
}

// Represents a single instance of an item in the character's inventory, used for non-stackable items like weapons and armor that may have unique properties or custom names
export type InventoryInstanceRecord = ItemInstanceData;

// #endregion

// #region --- Helper Functions ---

/**
 * Clamps an ability score to be within the valid range of 1 to 20, ensuring that any updates to ability scores do not exceed the maximum or minimum allowed values in D&D 5e.
 * @param score The ability score to clamp.
 * @returns The clamped ability score.
 */
const clampAbilityScore = (score: number): number =>
  Math.max(1, Math.min(20, score));

/**
 * Clamps a character level to be within the valid range of 1 to 20, ensuring that any updates to character levels do not exceed the maximum or minimum allowed values in D&D 5e.
 * @param level The character level to clamp.
 * @returns The clamped character level.
 */
const clampCharacterLevel = (level: number): number =>
  Math.max(1, Math.min(20, level));

/**
 * Normalizes a quantity to be a positive integer, ensuring that any updates to item quantities do not result in negative or fractional values.
 * @param quantity The quantity to normalize.
 * @returns The normalized quantity.
 */
const normalizeQuantity = (quantity: number): number =>
  Math.max(1, Math.floor(quantity));

/**
 * Determines the default stacking mode for an item based on its type and metadata.
 * @param itemData The item data to determine the stacking mode for, which may include static metadata about the item such as its type and any specific stacking rules defined in the data.
 * @returns The default stacking mode for the item, which can be either "stack" for items that should be grouped together in the inventory (like consumables) or "instance" for items that should be tracked individually (like weapons and armor). The function uses sensible defaults based on item type if specific stacking metadata is not provided.
 */
const defaultStackMode = (itemData: ItemData | null): "stack" | "instance" => {
  if (itemData?.stacking?.mode) {
    return itemData.stacking.mode;
  }

  // Sensible defaults when static metadata is missing.
  if (!itemData) return "stack";
  if (
    itemData.type === "weapon" ||
    itemData.type === "armor" ||
    itemData.type === "magic_item"
  ) {
    return "instance";
  }

  return "stack";
};

/**
 * Creates a new inventory stack record for a given base item ID and quantity.
 * @param baseItemId The ID of the base item to create a stack for.
 * @param quantity The quantity of items in the stack.
 * @returns A new inventory stack record with a unique stack ID and normalized quantity.
 */
const toStackRecord = (
  baseItemId: string,
  quantity: number,
): InventoryStackRecord => ({
  stackId: generateUuidV4(),
  baseItemId,
  quantity: normalizeQuantity(quantity),
});

/**
 * Creates a new inventory instance record for a given base item ID.
 * @param baseItemId The ID of the base item to create an instance for.
 * @returns A new inventory instance record with a unique instance ID.
 */
const toInstanceRecord = (baseItemId: string): InventoryInstanceRecord => ({
  instanceId: generateUuidV4(),
  baseItemId,
});

/**
 * Sanitizes an array of character class tracks by removing invalid entries and normalizing levels.
 * Invalid entries include tracks with missing class IDs or non-positive levels. The function also ensures that all levels are integers and at least 1.
 * @param tracks The array of character class tracks to sanitize.
 * @returns A new array of sanitized character class tracks.
 */
const sanitizeClassTracks = (
  tracks: CharacterClassTrack[],
): CharacterClassTrack[] =>
  tracks
    .filter((track) => track.classId && track.level > 0)
    .map((track) => ({
      classId: track.classId,
      subclassId: track.subclassId ?? null,
      level: clampCharacterLevel(Math.floor(track.level)),
    }));

/**
 * Calculates the total levels across all character class tracks.
 * @param tracks The array of character class tracks to calculate the total levels for.
 * @returns The total levels of all character class tracks.
 */
const getTotalClassTrackLevels = (tracks: CharacterClassTrack[]): number =>
  tracks.reduce((total, track) => total + track.level, 0);

/**
 * Upserts a character class track in the array of tracks. 
 * If a track with the specified class ID already exists, it updates that track with the provided updates. 
 * If no such track exists, it creates a new track with the given class ID and updates.
 * @param tracks The array of character class tracks to update.
 * @param classId The ID of the class track to upsert.
 * @param updates The updates to apply to the class track.
 * @returns A new array of character class tracks with the upserted track.
 */
const upsertClassTrack = (
  tracks: CharacterClassTrack[],
  classId: string,
  updates: Partial<CharacterClassTrack>,
): CharacterClassTrack[] => {
  const existingIndex = tracks.findIndex((track) => track.classId === classId);

  if (existingIndex === -1) {
    const baseLevel = clampCharacterLevel(Math.floor(updates.level ?? 1));
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
          level: clampCharacterLevel(Math.floor(updates.level ?? track.level)),
        },
  );
};

const buildLevelChoiceFromDraft = (
  draft: LevelUpDraft,
): Partial<LevelChoice> => ({
  selectedClassId: draft.targetClassId ?? undefined,
  hpGained: draft.hpGained ?? undefined,
  ...(Object.keys(draft.asiChoices).length > 0 ? { asiChoices: draft.asiChoices } : {}),
  ...(draft.featId ? { featId: draft.featId } : {}),
  ...(draft.skillChoices.length > 0 ? { skillChoices: draft.skillChoices } : {}),
  ...(draft.expertiseChoices.length > 0
    ? { expertiseChoices: draft.expertiseChoices }
    : {}),
  ...(draft.weaponChoices.length > 0 ? { weaponChoices: draft.weaponChoices } : {}),
  ...(draft.toolChoices.length > 0 ? { toolChoices: draft.toolChoices } : {}),
  ...(draft.languageChoices.length > 0
    ? { languageChoices: draft.languageChoices }
    : {}),
  ...(Object.keys(draft.featureChoices).length > 0
    ? { featureChoices: draft.featureChoices }
    : {}),
});

// #endregion

// #region --- Store Types ---

/**
 * CharacterState represents the complete state of a D&D character, including core character information, spells, inventory, and combat status. 
 * This interface defines all the properties that make up the character's state, which is managed by the Zustand store. 
 * It includes fields for player and character names, alignment, experience, level, race, class, and various other attributes.
 */
export interface CharacterState {
  // #region --- Core Character State ---

  // The name of the player controlling the character
  playerName: string;
  // The name of the character, used for display purposes on the character sheet and in the UI
  name: string;
  // The character's alignment, which can be used for role-playing and may interact with certain traits or spells that have alignment-based effects
  alignment: string;
  // The character's age, used for flavor and role-playing purposes, and may be relevant for certain races or backgrounds that have age-related traits or story elements
  age: string;
  // The character's height, used for flavor and role-playing purposes, and may be relevant for certain races or backgrounds that have height-related traits or story elements
  height: string;
  // The character's weight, used for flavor and role-playing purposes, and may be relevant for certain races or backgrounds that have weight-related traits or story elements
  weight: string;
  // The character's eye color, used for flavor and role-playing purposes, and may be relevant for certain races or backgrounds that have eye color-related traits or story elements
  eyes: string;
  // The character's skin color, used for flavor and role-playing purposes, and may be relevant for certain races or backgrounds that have skin color-related traits or story elements
  skin: string;
  // The character's hair color, used for flavor and role-playing purposes, and may be relevant for certain races or backgrounds that have hair color-related traits or story elements
  hair: string;
  // A description of the character's overall appearance, which can include details about clothing, accessories, and other visual elements
  appearance: string;
  // The character's backstory, providing context for their motivations, history, and personality
  backstory: string;
  // The character's personality traits, which can influence their behavior and interactions with others
  personalityTraits: string;
  // The character's ideals, which represent their core beliefs and guiding principles
  ideals: string;
  // The character's bonds, which represent their connections to people, places, or events
  bonds: string;
  // The character's flaws, which represent their weaknesses or vulnerabilities
  flaws: string;
  // The character's affiliations with allies and organizations, which can influence their actions and story
  alliesAndOrganizations: string;

  // The total experience points the character has accumulated, which determines their level and progression through the game
  xp: number;
  // The character's current level, derived from their experience points
  level: number;
  // Determines whether level-up availability is gated by XP thresholds or allowed at any time.
  levelUpMode: LevelUpMode;
  // The ID of the character's race, used to look up race-specific traits and abilities
  raceId: string | null;
  // The ID of the character's subrace, if applicable, used to look up subrace-specific traits and abilities
  subraceId: string | null;
  // The ID of the character's primary class, used to look up class-specific traits and abilities
  classId: string | null;
  // The ID of the character's subclass, if applicable, used to look up subclass-specific traits and abilities
  subclassId: string | null;
  // An array of the character's class tracks, used to manage multi-classing by tracking each class the character has levels in along with their respective levels and subclasses
  classTracks: CharacterClassTrack[];

  // The character's base ability scores for each of the six abilities (str, dex, con, int, wis, cha)
  baseAbilityScores: Record<Ability, number>;
  // A record of the character's hit point rolls by level, used to track the HP gained at each level for accurate calculations of current and maximum HP
  hpRolls: Record<number, number>;
  // The character's chosen racial bonuses, which are applied to their base ability scores and may be selected during character creation
  chosenRacialBonuses: Partial<Record<Ability, number>>;
  // Tracks which ability-assignment ruleset the user selected in character creation.
  abilityAssignmentMethod: AbilityAssignmentMethod;
  // Tracks whether rolling uses virtual dice generation or physical entry mode.
  abilityRollingInputMode: RollingInputMode;
  // Explicit acknowledgement for point-buy house-rule overrides.
  abilityPointBuyOverrideAccepted: boolean;
  // Becomes true when the user confirms the ability assignment step.
  abilityAssignmentCompleted: boolean;
  // Stores generated 4d6-drop-lowest virtual rolls for assignment.
  abilityVirtualRolls: VirtualAbilityRoll[];
  // Stores per-ability assignments chosen from virtual roll totals.
  abilityVirtualRollAssignments: Partial<Record<Ability, number>>;
  // The ID of the character's background, used to look up background-specific traits and abilities
  backgroundId: string | null;
  // The skills chosen from the character's racial options
  chosenRacialSkills: Skill[];
  // The skills chosen from the character's background options
  chosenBackgroundSkills: Skill[];
  // A record of the character's choices made at each level, such as ability score improvements, feat selections, etc...
  choicesByLevel: Record<number, LevelChoice>;
  // An array of feats acquired by the character, including the level at which they were acquired and any relevant metadata about the feat acquisition
  acquiredFeats: FeatAcquisitionEntry[];

  // #endregion

  // #region --- Spells State ---

  // An array of spell IDs representing the spells known by the character
  spellsKnown: string[];
  // An array of spell IDs representing the spells prepared by the character
  spellsPrepared: string[];
  // An array of spell IDs that have been designated as free-school picks (exempt from school restrictions)
  freeSchoolKnownSpellIds: string[];
  // A record of expended spell slots by spell level, used to track the character's available spell slots for casting spells and managing spell slot recovery during rests
  expendedSpellSlots: Record<number, number>;
  // The number of expended pact magic slots, used to track the character's available pact slots for warlocks and manage their recovery during rests
  expendedPactSlots: number;
  // Tracks expended uses for trait-granted actions keyed by action id
  expendedTraitActionUses: Record<string, number>;

  // #endregion

  // #region --- Inventory State ---

  // An array of inventory stack records representing the character's stackable items, where each record includes a unique stack ID, the base item ID, and the quantity of items in the stack
  inventoryStacks: InventoryStackRecord[];
  // An array of inventory instance records representing the character's individual items, where each record includes a unique instance ID, the base item ID, and any relevant metadata about the item
  inventoryInstances: InventoryInstanceRecord[];
  // The ID of the armor instance currently equipped by the character, or null if no armor is equipped
  equippedArmorInstanceId: UUID | null;
  // The ID of the shield instance currently equipped by the character, or null if no shield is equipped
  equippedShieldInstanceId: UUID | null;
  // An array of weapon instance IDs currently equipped by the character
  equippedWeaponInstanceIds: UUID[];
  // An array of item instance IDs that are currently attuned, used to track which magic items the character has attuned and manage attunement limits
  attunedInstanceIds: UUID[];

  // #endregion

  // #region --- Combat State ---

  // The current hit points of the character, which can be modified by taking damage or healing
  damageTaken: number;
  // The current temporary hit points of the character, which can be set by certain spells or abilities and are lost before regular hit points when taking damage
  tempHp: number;
  // An object tracking the number of successful and failed death saving throws, used to manage the character's status when at 0 HP and determine if they stabilize or die after three successes or failures
  deathSaves: { successes: number; failures: number };
  // The number of hit dice expended by the character, used to track the character's available hit dice for healing during rests
  expendedHitDice: number;

  // #endregion

  // A boolean indicating whether the character setup is complete, used to determine if the character is ready for gameplay
  isSetupComplete: boolean;

  levelUpModalState: {
    isOpen: boolean;
    targetLevel: number | null;
    isBlocking: boolean;
  };

  restModalState: {
    isOpen: boolean;
    restType: RestType;
  };

  // Records the selected option index (per choice-group index) for starting equipment bundles, set during character creation
  startingEquipmentSelections: Record<number, number>;
  // Records selected concrete item IDs for category references inside starting equipment bundles
  startingEquipmentCategorySelections: Record<string, string>;
}

interface CharacterActions {
  // #region --- Character Setup Actions ---

  setPlayerName: (playerName: string) => void;
  
  setName: (name: string) => void;
  
  setAlignment: (alignment: string) => void;

  updateRoleplayField: (field: keyof CharacterState, value: string) => void;
  
  setXp: (xp: number) => void;

  setLevelUpMode: (mode: LevelUpMode) => void;
  
  setRace: (raceId: string) => void;
  
  setSubrace: (subraceId: string | null) => void;
  
  setClass: (classId: string) => void;
  
  setSubclass: (subclassId: string | null) => void;

  // #region --- Multi-Classing Actions ---

  setClassTracks: (tracks: CharacterClassTrack[]) => void;
  
  addClassTrack: (classId: string, startingLevel?: number) => void;
  
  removeClassTrack: (classId: string) => void;
  
  setClassTrackLevel: (classId: string, level: number) => void;
  
  setClassTrackSubclass: (classId: string, subclassId: string | null) => void;

  // #endregion

  // #region --- Background and Ability Actions ---

  setBackground: (background: string) => void;
  
  setLevel: (level: number) => void;

  /**
   * Atomically commits a level-up draft in one transaction.
   * Returns false if required inputs are invalid and no state is changed.
   */
  commitLevelUpTransaction: (payload: {
    targetLevel: number;
    draft: LevelUpDraft;
  }) => boolean;
  
  updateLevelChoice: (level: number, updates: Partial<LevelChoice>) => void;
  
  setBaseAbilityScore: (ability: Ability, score: number) => void;
  
  setBaseAbilityScores: (scores: Record<Ability, number>) => void;

  setAbilityAssignmentMethod: (method: AbilityAssignmentMethod) => void;

  setAbilityRollingInputMode: (mode: RollingInputMode) => void;

  setAbilityPointBuyOverrideAccepted: (accepted: boolean) => void;

  setAbilityAssignmentCompleted: (completed: boolean) => void;

  setAbilityVirtualRolls: (rolls: VirtualAbilityRoll[]) => void;

  setAbilityVirtualRollAssignment: (
    ability: Ability,
    score: number | null,
  ) => void;

  clearAbilityVirtualRollAssignments: () => void;
  
  setRacialSkills: (skills: Skill[]) => void;
  
  setChosenRacialBonuses: (bonuses: Partial<Record<Ability, number>>) => void;
  
  setBackgroundSkills: (skills: Skill[]) => void;
  
  setOriginFeat: (featId: string | null) => void;

  /**
   * Records the user's equipment bundle choice for a given choice-group index and
   * adds the selected bundle's items to the inventory. Re-selecting the same group
   * index replaces the previous selection (old items are NOT auto-removed since
   * inventory management is tracked externally during creation).
   */
  setStartingEquipmentSelection: (groupIndex: number, optionIndex: number) => void;

  /**
   * Records a concrete item pick for a specific category reference embedded in a
   * starting-equipment option bundle.
   */
  setStartingEquipmentCategorySelection: (
    selectionKey: string,
    itemId: string,
  ) => void;

  openLevelUpModal: (targetLevel: number, options?: { isBlocking?: boolean }) => void;

  closeLevelUpModal: () => void;

  openRestModal: (restType: RestType) => void;

  closeRestModal: () => void;

  // #endregion

  // #endregion

  // #region --- Spell Actions ---

  learnSpell: (spellId: string) => void;
  
  prepareSpell: (spellId: string) => void;
  
  unprepareSpell: (spellId: string) => void;

  /** Removes a spell from spellsKnown (used during character creation). */
  unlearnSpell: (spellId: string) => void;

  designateFreeSchoolSpell: (spellId: string) => void;

  undesignateFreeSchoolSpell: (spellId: string) => void;

  trimFreeSchoolDesignations: (limit: number) => void;

  // #endregion

  // #region --- Combat Actions ---

  expendSpellSlot: (level: number) => void;
  
  restoreSpellSlot: (level: number) => void;
  
  expendPactSlot: () => void;

  expendTraitActionUse: (actionId: string) => void;

  restoreTraitActionUse: (actionId: string) => void;

  // #endregion

  // #region --- Resting Actions ---

  takeLongRest: () => void;
  
  takeShortRest: () => void;

  // #endregion

  // #region --- Inventory Actions ---

  addInventoryItem: (itemId: string, quantity: number) => void;
  
  removeInventoryItem: (itemId: string, quantity: number) => void;

  /** Removes a single instance item by its exact instanceId, cleaning up all equipped and attuned references for that instance. */
  removeInventoryInstance: (instanceId: UUID) => void;
  
  equipArmorInstance: (instanceId: UUID | null) => void;
  
  equipShieldInstance: (instanceId: UUID | null) => void;
  
  equipWeaponInstance: (instanceId: UUID) => void;
  
  unequipWeaponInstance: (instanceId: UUID) => void;
  
  createItemInstance: (baseItemId: string, quantity?: number) => UUID[];
  
  attuneInstance: (instanceId: UUID) => void;
  
  unattuneInstance: (instanceId: UUID) => void;

  // #endregion

  // #region --- Combat Actions ---

  takeDamage: (amount: number) => void;
  
  heal: (amount: number) => void;
  
  setTempHp: (amount: number) => void;
  
  recordDeathSave: (type: "successes" | "failures", value: boolean) => void;
  
  expendHitDie: () => void;

  // #endregion

  // #region --- Character Saving Actions ---

  completeSetup: () => void;
  
  resetCharacter: () => void;
  
  /**
   * Replaces the character state with the baseline merged with the given overrides,
   * and marks setup as complete so the character sheet renders immediately.
   * Accepts UUID-backed character state overrides. All inventory fields must use UUID-based
   * structures (`inventoryStacks`, `inventoryInstances`, `equippedArmorInstanceId`, etc.).
   */
  hydrateCharacter: (overrides: Partial<CharacterState>) => void;

  // #endregion
}

type CharacterStore = CharacterState & CharacterActions;

// #endregion

// #region --- Full Store Implementation ---

/**
 * Baseline character state used for initializing the store and resetting the character. 
 * This state represents a level 1 character with no race, class, or equipment, and serves as the default state for a new character before any choices are made. 
 * It includes sensible defaults for all fields to ensure that the character sheet can render without errors even when no data is present.
 */
export const BASELINE_CHARACTER_STATE: CharacterState = {
  // #region --- Core Character State ---
  
  playerName: "",
  name: "",
  alignment: "",
  age: "",
  height: "",
  weight: "",
  eyes: "",
  skin: "",
  hair: "",
  appearance: "",
  backstory: "",
  personalityTraits: "",
  ideals: "",
  bonds: "",
  flaws: "",
  alliesAndOrganizations: "",
  xp: 0,
  level: 1,
  levelUpMode: "xp_gated",
  raceId: null,
  subraceId: null,
  classId: null,
  subclassId: null,
  classTracks: [],
  baseAbilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  hpRolls: {},
  chosenRacialBonuses: {},
  abilityAssignmentMethod: "standard_array",
  abilityRollingInputMode: "virtual",
  abilityPointBuyOverrideAccepted: false,
  abilityAssignmentCompleted: false,
  abilityVirtualRolls: [],
  abilityVirtualRollAssignments: {},
  backgroundId: null,
  chosenRacialSkills: [],
  chosenBackgroundSkills: [],
  choicesByLevel: {},
  acquiredFeats: [],

  // #endregion

  // #region --- Spells State ---

  spellsKnown: [],
  spellsPrepared: [],
  freeSchoolKnownSpellIds: [],
  expendedSpellSlots: {},
  expendedPactSlots: 0,
  expendedTraitActionUses: {},

  // #endregion

  // #region --- Inventory State ---

  inventoryStacks: [],
  inventoryInstances: [],
  equippedArmorInstanceId: null,
  equippedShieldInstanceId: null,
  equippedWeaponInstanceIds: [],
  attunedInstanceIds: [],

  // #endregion

  // #region --- Combat State ---

  damageTaken: 0,
  tempHp: 0,
  deathSaves: { successes: 0, failures: 0 },
  expendedHitDice: 0,
  
  // #endregion
  
  isSetupComplete: false,

  levelUpModalState: {
    isOpen: false,
    targetLevel: null,
    isBlocking: false,
  },

  restModalState: {
    isOpen: false,
    restType: "short",
  },

  startingEquipmentSelections: {},
  startingEquipmentCategorySelections: {},
};

/**
 * Zustand store for managing the state of a D&D character, including core character info, spells, inventory, and combat status.
 * Provides actions for updating character details, managing spells, handling inventory changes,
 * and tracking combat-related information like damage and death saves.
 */
export const useCharacterStore = create<CharacterStore>((set) => ({
  // #region --- Initial State ---

  ...BASELINE_CHARACTER_STATE,

  // #endregion

  // #region --- Setup Actions ---

  setPlayerName: (playerName) => set({ playerName }),

  setName: (name) => set({ name }),

  setAlignment: (alignment) => set({ alignment }),

  updateRoleplayField: (field, value) => set({ [field]: value }),

  setXp: (xp) =>
    set({
      xp: Math.max(0, Math.floor(xp)),
    }),

  setLevelUpMode: (mode) =>
    set({
      levelUpMode: mode,
    }),

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

  commitLevelUpTransaction: ({ targetLevel, draft }) => {
    let committed = false;

    set((state) => {
      if (!draft.targetClassId) {
        return state;
      }

      const clampedTargetLevel = clampCharacterLevel(targetLevel);

      const nextTracksBase = draft.isNewMulticlass
        ? upsertClassTrack(state.classTracks, draft.targetClassId, { level: 1 })
        : upsertClassTrack(state.classTracks, draft.targetClassId, {
            level: draft.targetClassLevel,
          });

      const nextTracks = draft.newSubclassId
        ? upsertClassTrack(nextTracksBase, draft.targetClassId, {
            subclassId: draft.newSubclassId,
          })
        : nextTracksBase;

      const nextTotalLevel = clampCharacterLevel(getTotalClassTrackLevels(nextTracks));

      const currentChoiceForLevel = state.choicesByLevel[clampedTargetLevel] || {};
      const nextLevelChoice: LevelChoice = {
        ...currentChoiceForLevel,
        ...buildLevelChoiceFromDraft(draft),
      };

      const nextChoicesByLevel: Record<number, LevelChoice> = {
        ...state.choicesByLevel,
        [clampedTargetLevel]: nextLevelChoice,
      };

      const nextAcquiredFeats = state.acquiredFeats.filter(
        (entry) =>
          !(entry.source === "level_up" && entry.sourceLevel === clampedTargetLevel),
      );

      if (draft.featId && draft.featId.trim().length > 0) {
        nextAcquiredFeats.push({
          featId: draft.featId,
          source: "level_up",
          sourceLevel: clampedTargetLevel,
        });
      }

      const selectedFeatureSpellIds = Object.values(draft.featureChoices).filter(
        (value) => typeof value === "string" && value.startsWith("spell_"),
      );

      const nextSpellsKnown = Array.from(
        new Set([
          ...state.spellsKnown,
          ...draft.cantripsLearned,
          ...draft.spellsLearned,
          ...selectedFeatureSpellIds,
        ]),
      );

      const nextHpRolls =
        typeof draft.hpGained === "number" && draft.hpGained > 0
          ? {
              ...state.hpRolls,
              [clampedTargetLevel]: Math.floor(draft.hpGained),
            }
          : state.hpRolls;

      const nextPrimaryClassId = state.classId ?? nextTracks[0]?.classId ?? null;

      const shouldMirrorSubclass =
        state.classId === null || state.classId === draft.targetClassId;

      const nextTopLevelSubclassId = shouldMirrorSubclass
        ? (draft.newSubclassId ??
          nextTracks.find((track) => track.classId === draft.targetClassId)
            ?.subclassId ??
          state.subclassId)
        : state.subclassId;

      committed = true;

      return {
        classTracks: nextTracks,
        classId: nextPrimaryClassId,
        subclassId: nextTopLevelSubclassId,
        level: nextTotalLevel,
        hpRolls: nextHpRolls,
        choicesByLevel: nextChoicesByLevel,
        acquiredFeats: nextAcquiredFeats,
        spellsKnown: nextSpellsKnown,
        levelUpModalState: {
          isOpen: false,
          targetLevel: null,
          isBlocking: false,
        },
        restModalState: {
          isOpen: false,
          restType: "short",
        },
      };
    });

    return committed;
  },

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

      // If a feat choice is being updated, update the acquired feats list accordingly
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
      // Reset equipment bundle selections whenever the class changes since the
      // choice groups are class-specific
      startingEquipmentSelections: {},
      startingEquipmentCategorySelections: {},
    })),

  setSubclass: (subclassId) =>
    set((state) => ({
      subclassId,
      classTracks: state.classId
        ? upsertClassTrack(state.classTracks, state.classId, { subclassId })
        : state.classTracks, // If there's no class, subclass can't be associated with a track, so just update the state and rely on the UI to handle this edge case <- TODO: Maybe should just prevent setting a subclass if there's no class?
      acquiredFeats: state.acquiredFeats.filter(
        (entry) => entry.source !== "origin", // Remove any origin feats since those are tied to the subclass
      ),
    })),

  // #region --- Setup Multi Class Actions ---

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
      const primaryTrack = nextTracks[0] || null; // After removing the specified class track, determine the new primary track and total level for the character based on the remaining tracks

      return {
        classTracks: nextTracks,
        classId:
          state.classId === classId
            ? (primaryTrack?.classId ?? null)
            : state.classId, // If the removed track was the primary track, update the primary class ID to the new primary track's class ID or null if no tracks remain; otherwise, keep the existing primary class ID
        subclassId:
          state.classId === classId
            ? (primaryTrack?.subclassId ?? null)
            : state.subclassId, // If the removed track was the primary track, update the subclass ID to match the new primary track's subclass ID or null if no tracks remain; otherwise, keep the existing subclass ID
        level:
          nextTracks.length > 0
            ? clampCharacterLevel(getTotalClassTrackLevels(nextTracks))
            : 1, // If there are remaining tracks, recalculate the total level; if no tracks remain, reset to level 1
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

      // Iterate over the provided scores and clamp each one to ensure they are within valid bounds, while also validating that the incoming values are numbers
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

  setAbilityAssignmentMethod: (method) =>
    set((state) => ({
      abilityAssignmentMethod: method,
      abilityAssignmentCompleted: false,
      abilityPointBuyOverrideAccepted:
        method === "point_buy"
          ? state.abilityPointBuyOverrideAccepted
          : false,
      abilityVirtualRollAssignments: {},
    })),

  setAbilityRollingInputMode: (mode) =>
    set({
      abilityRollingInputMode: mode,
      abilityAssignmentCompleted: false,
      abilityVirtualRollAssignments: mode === "virtual" ? {} : {},
    }),

  setAbilityPointBuyOverrideAccepted: (accepted) =>
    set({ abilityPointBuyOverrideAccepted: accepted }),

  setAbilityAssignmentCompleted: (completed) =>
    set({ abilityAssignmentCompleted: completed }),

  setAbilityVirtualRolls: (rolls) =>
    set({
      abilityVirtualRolls: rolls,
      abilityVirtualRollAssignments: {},
      abilityAssignmentCompleted: false,
    }),

  setAbilityVirtualRollAssignment: (ability, score) =>
    set((state) => {
      const nextAssignments = { ...state.abilityVirtualRollAssignments };
      if (score === null) {
        delete nextAssignments[ability];
      } else {
        nextAssignments[ability] = Math.floor(score);
      }
      return {
        abilityVirtualRollAssignments: nextAssignments,
        abilityAssignmentCompleted: false,
      };
    }),

  clearAbilityVirtualRollAssignments: () =>
    set({
      abilityVirtualRollAssignments: {},
      abilityAssignmentCompleted: false,
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

  setStartingEquipmentSelection: (groupIndex, optionIndex) =>
    set((state) => {
      // Persist the selection index for requirement resolution
      const updatedSelections = {
        ...state.startingEquipmentSelections,
        [groupIndex]: optionIndex,
      };

      // Clear any category picks for this choice group when option changes.
      const groupPrefix = `${groupIndex}:`;
      const updatedCategorySelections = Object.fromEntries(
        Object.entries(state.startingEquipmentCategorySelections).filter(
          ([key]) => !key.startsWith(groupPrefix),
        ),
      );

      return {
        startingEquipmentSelections: updatedSelections,
        startingEquipmentCategorySelections: updatedCategorySelections,
      };
    }),

  setStartingEquipmentCategorySelection: (selectionKey, itemId) =>
    set((state) => ({
      startingEquipmentCategorySelections: {
        ...state.startingEquipmentCategorySelections,
        [selectionKey]: itemId,
      },
    })),

  openLevelUpModal: (targetLevel, options) =>
    set({
      levelUpModalState: {
        isOpen: true,
        targetLevel: clampCharacterLevel(targetLevel),
        isBlocking: options?.isBlocking ?? false,
      },
    }),

  closeLevelUpModal: () =>
    set((state) => {
      if (state.levelUpModalState.isBlocking) {
        return state;
      }

      return {
        levelUpModalState: {
          isOpen: false,
          targetLevel: null,
          isBlocking: false,
        },
      };
    }),

  openRestModal: (restType) =>
    set({
      restModalState: {
        isOpen: true,
        restType,
      },
    }),

  closeRestModal: () =>
    set({
      restModalState: {
        isOpen: false,
        restType: "short",
      },
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

  unlearnSpell: (spellId) =>
    set((state) => ({
      spellsKnown: state.spellsKnown.filter((id) => id !== spellId),
      freeSchoolKnownSpellIds: state.freeSchoolKnownSpellIds.filter(
        (id) => id !== spellId,
      ),
    })),

  designateFreeSchoolSpell: (spellId) =>
    set((state) => {
      if (!spellId || state.freeSchoolKnownSpellIds.includes(spellId)) {
        return state;
      }
      return {
        freeSchoolKnownSpellIds: [...state.freeSchoolKnownSpellIds, spellId],
      };
    }),

  undesignateFreeSchoolSpell: (spellId) =>
    set((state) => ({
      freeSchoolKnownSpellIds: state.freeSchoolKnownSpellIds.filter(
        (id) => id !== spellId,
      ),
    })),

  trimFreeSchoolDesignations: (limit) =>
    set((state) => ({
      freeSchoolKnownSpellIds: state.freeSchoolKnownSpellIds.slice(0, limit),
    })),

  // #endregion

  // #region --- Combat Actions ---

  expendSpellSlot: (level) =>
    set((state) => {
      if (!Number.isInteger(level) || level < 1 || level > 9) {
        return state;
      }

      const currentUsed = state.expendedSpellSlots[level] ?? 0; // If the character has already expended all their slots for this level, don't allow further expenditure
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

  expendTraitActionUse: (actionId) =>
    set((state) => {
      if (!actionId) return state;
      const current = state.expendedTraitActionUses[actionId] ?? 0;
      return {
        expendedTraitActionUses: {
          ...state.expendedTraitActionUses,
          [actionId]: current + 1,
        },
      };
    }),

  restoreTraitActionUse: (actionId) =>
    set((state) => {
      if (!actionId) return state;
      const current = state.expendedTraitActionUses[actionId] ?? 0;
      if (current <= 0) return state;

      const updated = {
        ...state.expendedTraitActionUses,
        [actionId]: current - 1,
      };

      if (updated[actionId] === 0) {
        delete updated[actionId];
      }

      return {
        expendedTraitActionUses: updated,
      };
    }),

  // #endregion

  // #region --- Rest Actions ---

  takeLongRest: () =>
    set((state) => ({
      expendedSpellSlots: {}, // Wipes all normal slot usage
      expendedPactSlots: 0, // Wipes pact slot usage
      expendedTraitActionUses: {}, // Resets tracked trait action usage
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
      // TODO: Track reset cadence per action (short_rest vs long_rest) and only
      // clear short-rest resources here. For now, all tracked trait uses reset.
      expendedTraitActionUses: {}, // Resets tracked trait action usage
      // Normal spell slots remain untouched
    })),

  // #endregion

  // #region --- Inventory Actions ---

  addInventoryItem: (itemId, quantity) =>
    set((state) => {
      const normalizedQuantity = normalizeQuantity(quantity);
      const itemData = getItemById(itemId);
      const stackMode = defaultStackMode(itemData);

      const nextInventoryStacks = [...state.inventoryStacks];
      const nextInventoryInstances = [...state.inventoryInstances];

      if (stackMode === "stack") {
        const existingStackIndex = nextInventoryStacks.findIndex(
          (stack) => stack.baseItemId === itemId,
        );
        if (existingStackIndex >= 0) {
          nextInventoryStacks[existingStackIndex] = {
            ...nextInventoryStacks[existingStackIndex],
            quantity:
              nextInventoryStacks[existingStackIndex].quantity +
              normalizedQuantity,
          };
        } else {
          nextInventoryStacks.push(toStackRecord(itemId, normalizedQuantity));
        }
      } else {
        for (let index = 0; index < normalizedQuantity; index += 1) {
          nextInventoryInstances.push(toInstanceRecord(itemId));
        }
      }

      return {
        inventoryStacks: nextInventoryStacks,
        inventoryInstances: nextInventoryInstances,
      };
    }),

  removeInventoryItem: (itemId, quantity) =>
    set((state) => {
      const normalizedQuantity = normalizeQuantity(quantity);

      const nextInventoryStacks = state.inventoryStacks
        .map((stack) =>
          stack.baseItemId === itemId
            ? { ...stack, quantity: stack.quantity - normalizedQuantity }
            : stack,
        )
        .filter((stack) => stack.quantity > 0);

      const toRemoveCount = normalizedQuantity;
      let removedCount = 0;
      const removedInstanceIds = new Set<UUID>();
      const nextInventoryInstances = state.inventoryInstances.filter(
        (instance) => {
          if (instance.baseItemId !== itemId || removedCount >= toRemoveCount) {
            return true;
          }

          removedInstanceIds.add(instance.instanceId);
          removedCount += 1;
          return false;
        },
      );

      return {
        inventoryStacks: nextInventoryStacks,
        inventoryInstances: nextInventoryInstances,
        equippedArmorInstanceId:
          state.equippedArmorInstanceId &&
          removedInstanceIds.has(state.equippedArmorInstanceId)
            ? null
            : state.equippedArmorInstanceId,
        equippedShieldInstanceId:
          state.equippedShieldInstanceId &&
          removedInstanceIds.has(state.equippedShieldInstanceId)
            ? null
            : state.equippedShieldInstanceId,
        equippedWeaponInstanceIds: state.equippedWeaponInstanceIds.filter(
          (instanceId) => !removedInstanceIds.has(instanceId),
        ),
        attunedInstanceIds: state.attunedInstanceIds.filter(
          (instanceId) => !removedInstanceIds.has(instanceId),
        ),
      };
    }),

  removeInventoryInstance: (instanceId) =>
    set((state) => ({
      inventoryInstances: state.inventoryInstances.filter(
        (instance) => instance.instanceId !== instanceId,
      ),
      equippedArmorInstanceId:
        state.equippedArmorInstanceId === instanceId
          ? null
          : state.equippedArmorInstanceId,
      equippedShieldInstanceId:
        state.equippedShieldInstanceId === instanceId
          ? null
          : state.equippedShieldInstanceId,
      equippedWeaponInstanceIds: state.equippedWeaponInstanceIds.filter(
        (id) => id !== instanceId,
      ),
      attunedInstanceIds: state.attunedInstanceIds.filter(
        (id) => id !== instanceId,
      ),
    })),

  equipArmorInstance: (instanceId) =>
    set(() => ({
      equippedArmorInstanceId: instanceId,
    })),

  equipShieldInstance: (instanceId) =>
    set(() => ({
      equippedShieldInstanceId: instanceId,
    })),

  equipWeaponInstance: (instanceId) =>
    set((state) => {
      const instance = state.inventoryInstances.find(
        (entry) => entry.instanceId === instanceId,
      );
      if (!instance) return state;
      if (state.equippedWeaponInstanceIds.includes(instanceId)) return state;

      return {
        equippedWeaponInstanceIds: [
          ...state.equippedWeaponInstanceIds,
          instanceId,
        ],
      };
    }),

  unequipWeaponInstance: (instanceId) =>
    set((state) => ({
      equippedWeaponInstanceIds: state.equippedWeaponInstanceIds.filter(
        (id) => id !== instanceId,
      ),
    })),

  createItemInstance: (baseItemId, quantity = 1) => {
    const normalizedQuantity = normalizeQuantity(quantity);
    const createdInstances = Array.from({ length: normalizedQuantity }, () =>
      toInstanceRecord(baseItemId),
    );

    set((state) => ({
      inventoryInstances: [...state.inventoryInstances, ...createdInstances],
    }));

    return createdInstances.map((instance) => instance.instanceId);
  },

  attuneInstance: (instanceId) =>
    set((state) => {
      if (state.attunedInstanceIds.includes(instanceId)) return state;
      if (state.attunedInstanceIds.length >= 3) return state;
      return {
        attunedInstanceIds: [...state.attunedInstanceIds, instanceId],
      };
    }),

  unattuneInstance: (instanceId) =>
    set((state) => ({
      attunedInstanceIds: state.attunedInstanceIds.filter(
        (id) => id !== instanceId,
      ),
    })),

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

  resetCharacter: () => set({ ...BASELINE_CHARACTER_STATE }),

  hydrateCharacter: (overrides) =>
    set(() => {
      const merged = {
        ...BASELINE_CHARACTER_STATE,
        ...overrides,
        isSetupComplete: true,
      };

      // Migration: reclassify stack records whose item catalog now specifies
      // "instance" mode. Each unit of quantity becomes its own instance record.
      const reclassifiedInstances: InventoryInstanceRecord[] = [];
      const correctedStacks = merged.inventoryStacks.filter((stack) => {
        const itemData = getItemById(stack.baseItemId);
        if (defaultStackMode(itemData) === "instance") {
          for (let i = 0; i < stack.quantity; i += 1) {
            reclassifiedInstances.push(toInstanceRecord(stack.baseItemId));
          }
          return false;
        }
        return true;
      });

      // Migration: deduplicate instance records with the same instanceId
      // (a sign of legacy copy-paste / bad serialization).
      const seenInstanceIds = new Set<UUID>();
      const cleanedInstances = [
        ...merged.inventoryInstances,
        ...reclassifiedInstances,
      ].filter((instance) => {
        if (seenInstanceIds.has(instance.instanceId)) return false;
        seenInstanceIds.add(instance.instanceId);
        return true;
      });

      // Drop equipped/attuned refs that no longer point to a valid instance.
      const validIds = new Set(cleanedInstances.map((i) => i.instanceId));
      return {
        ...merged,
        inventoryStacks: correctedStacks,
        inventoryInstances: cleanedInstances,
        equippedArmorInstanceId:
          merged.equippedArmorInstanceId &&
          validIds.has(merged.equippedArmorInstanceId)
            ? merged.equippedArmorInstanceId
            : null,
        equippedShieldInstanceId:
          merged.equippedShieldInstanceId &&
          validIds.has(merged.equippedShieldInstanceId)
            ? merged.equippedShieldInstanceId
            : null,
        equippedWeaponInstanceIds:
          merged.equippedWeaponInstanceIds.filter((id) => validIds.has(id)),
        attunedInstanceIds:
          merged.attunedInstanceIds.filter((id) => validIds.has(id)),
      };
    }),

  // #endregion
}));

// #endregion
