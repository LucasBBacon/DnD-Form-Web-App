import { z } from "zod";
import type { Skill } from "../types/common";
import type { LevelUpMode } from "../types/progression";
import type { SavedCharacterData, SavedCharacterFile } from "../types/savedCharacter";
import { ABILITIES } from "../utils/abilityConstants";
import type {
  AbilityAssignmentMethod,
  RollingInputMode,
} from "../utils/abilityAssignmentUtils";
import type { CharacterState } from "./useCharacterStore";

export const CURRENT_SCHEMA_VERSION = "1";
export const CURRENT_APP_VERSION = "0.0.0";

const SKILLS = [
  "acrobatics",
  "animal_handling",
  "arcana",
  "athletics",
  "deception",
  "history",
  "insight",
  "intimidation",
  "investigation",
  "medicine",
  "nature",
  "perception",
  "performance",
  "persuasion",
  "religion",
  "sleight_of_hand",
  "stealth",
  "survival",
] as const satisfies readonly Skill[];

const LEVEL_UP_MODES = [
  "xp",
  "milestone",
  "xp_gated",
  "milestone_anytime",
] as const satisfies readonly LevelUpMode[];

const ABILITY_ASSIGNMENT_METHODS = [
  "rolling",
  "standard_array",
  "point_buy",
] as const satisfies readonly AbilityAssignmentMethod[];

const ROLLING_INPUT_MODES = ["virtual", "physical"] as const satisfies readonly RollingInputMode[];

const abilitySchema = z.enum(ABILITIES);
const skillSchema = z.enum(SKILLS);

const coinPurseSchema = z.object({
  cp: z.number().int().min(0),
  sp: z.number().int().min(0),
  ep: z.number().int().min(0),
  gp: z.number().int().min(0),
  pp: z.number().int().min(0),
}).strip();

const characterClassTrackSchema = z.object({
  classId: z.string().min(1),
  subclassId: z.string().min(1).nullable(),
  level: z.number().int().min(1).max(20),
}).strip();

const virtualAbilityRollSchema = z.object({
  dice: z.tuple([
    z.number().int().min(1),
    z.number().int().min(1),
    z.number().int().min(1),
    z.number().int().min(1),
  ]),
  dropped: z.number().int().min(1),
  kept: z.tuple([
    z.number().int().min(1),
    z.number().int().min(1),
    z.number().int().min(1),
  ]),
  total: z.number().int().min(0),
}).strip();

const levelChoiceSchema = z.object({
  selectedClassId: z.string().min(1).optional(),
  hpGained: z.number().int().min(0).optional(),
  asiChoices: z.record(abilitySchema, z.number().int()).optional(),
  featId: z.string().min(1).optional(),
  featureChoices: z.record(z.string(), z.string()).optional(),
  skillChoices: z.array(skillSchema).optional(),
  expertiseChoices: z.array(skillSchema).optional(),
  weaponChoices: z.array(z.string()).optional(),
  toolChoices: z.array(z.string()).optional(),
  languageChoices: z.array(z.string()).optional(),
}).strip();

const featAcquisitionSchema = z.object({
  featId: z.string().min(1),
  source: z.enum(["origin", "level_up"]),
  sourceLevel: z.number().int().min(1).optional(),
  sourceId: z.string().min(1).optional(),
}).strip();

const itemInstanceSchema = z.object({
  instanceId: z.string().min(1),
  baseItemId: z.string().min(1),
  customName: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  overrides: z.record(z.string(), z.unknown()).optional(),
  createdFromCatalogBaseItemId: z.string().min(1).optional(),
  isCustom: z.boolean().optional(),
  versatileMode: z.enum(["one-handed", "two-handed"]).optional(),
}).strip();

const inventoryStackSchema = z.object({
  stackId: z.string().min(1),
  baseItemId: z.string().min(1),
  quantity: z.number().int().min(1),
}).strip();

const deathSavesSchema = z.object({
  success: z.number().int().min(0).max(3),
  failure: z.number().int().min(0).max(3),
}).strip();

const baseAbilityScoresSchema = z.object({
  str: z.number().int().min(1).max(20),
  dex: z.number().int().min(1).max(20),
  con: z.number().int().min(1).max(20),
  int: z.number().int().min(1).max(20),
  wis: z.number().int().min(1).max(20),
  cha: z.number().int().min(1).max(20),
}).strip();

const characterStateSchema = z.object({
  playerName: z.string(),
  name: z.string(),
  alignment: z.string(),
  age: z.string(),
  height: z.string(),
  weight: z.string(),
  eyes: z.string(),
  skin: z.string(),
  hair: z.string(),
  appearance: z.string(),
  backstory: z.string(),
  personalityTraits: z.string(),
  ideals: z.string(),
  bonds: z.string(),
  flaws: z.string(),
  alliesAndOrganizations: z.string(),
  xp: z.number().int().min(0),
  level: z.number().int().min(1).max(20),
  levelUpMode: z.enum(LEVEL_UP_MODES),
  raceId: z.string().min(1).nullable(),
  subraceId: z.string().min(1).nullable(),
  classId: z.string().min(1).nullable(),
  subclassId: z.string().min(1).nullable(),
  classTracks: z.array(characterClassTrackSchema),
  baseAbilityScores: baseAbilityScoresSchema,
  hpRolls: z.record(z.string(), z.number().int()),
  chosenRacialBonuses: z.partialRecord(abilitySchema, z.number().int()).default({}),
  abilityAssignmentMethod: z.enum(ABILITY_ASSIGNMENT_METHODS),
  abilityRollingInputMode: z.enum(ROLLING_INPUT_MODES),
  abilityPointBuyOverrideAccepted: z.boolean(),
  abilityAssignmentCompleted: z.boolean(),
  abilityVirtualRolls: z.array(virtualAbilityRollSchema),
  abilityVirtualRollAssignments: z.partialRecord(abilitySchema, z.number().int()).default({}),
  backgroundId: z.string().min(1).nullable(),
  chosenRacialSkills: z.array(skillSchema),
  chosenBackgroundSkills: z.array(skillSchema),
  choicesByLevel: z.record(z.string(), levelChoiceSchema),
  acquiredFeats: z.array(featAcquisitionSchema),
  spellsKnown: z.array(z.string()),
  spellsPrepared: z.array(z.string()),
  freeSchoolKnownSpellIds: z.array(z.string()),
  expendedSpellSlots: z.record(z.string(), z.number().int()),
  expendedPactSlots: z.number().int().min(0),
  expendedTraitActionUses: z.record(z.string(), z.number().int()),
  coinPurse: coinPurseSchema,
  inventoryStacks: z.array(inventoryStackSchema),
  inventoryInstances: z.array(itemInstanceSchema),
  equippedArmorInstanceId: z.string().min(1).nullable(),
  equippedShieldInstanceId: z.string().min(1).nullable(),
  equippedWeaponInstanceIds: z.array(z.string().min(1)),
  attunedInstanceIds: z.array(z.string().min(1)),
  damageTaken: z.number().int().min(0),
  tempHp: z.number().int().min(0),
  deathSaves: deathSavesSchema,
  expendedHitDice: z.number().int().min(0),
  isSetupComplete: z.boolean(),
  startingEquipmentSelections: z.record(z.string(), z.number().int()),
  startingEquipmentCategorySelections: z.record(z.string(), z.string()),
}).strip();

export const savedCharacterFileSchema = z.object({
  schemaVersion: z.string().min(1),
  savedAt: z.string().min(1),
  appVersion: z.string().min(1),
  character: characterStateSchema,
}).strip();

export type SavedCharacterFileResult =
  | { success: true; data: SavedCharacterFile }
  | { success: false; error: string };

export const SAVEABLE_STATE_KEYS = [
  "playerName",
  "name",
  "alignment",
  "age",
  "height",
  "weight",
  "eyes",
  "skin",
  "hair",
  "appearance",
  "backstory",
  "personalityTraits",
  "ideals",
  "bonds",
  "flaws",
  "alliesAndOrganizations",
  "xp",
  "level",
  "levelUpMode",
  "raceId",
  "subraceId",
  "classId",
  "subclassId",
  "classTracks",
  "baseAbilityScores",
  "hpRolls",
  "chosenRacialBonuses",
  "abilityAssignmentMethod",
  "abilityRollingInputMode",
  "abilityPointBuyOverrideAccepted",
  "abilityAssignmentCompleted",
  "abilityVirtualRolls",
  "abilityVirtualRollAssignments",
  "backgroundId",
  "chosenRacialSkills",
  "chosenBackgroundSkills",
  "choicesByLevel",
  "acquiredFeats",
  "spellsKnown",
  "spellsPrepared",
  "freeSchoolKnownSpellIds",
  "expendedSpellSlots",
  "expendedPactSlots",
  "expendedTraitActionUses",
  "coinPurse",
  "inventoryStacks",
  "inventoryInstances",
  "equippedArmorInstanceId",
  "equippedShieldInstanceId",
  "equippedWeaponInstanceIds",
  "attunedInstanceIds",
  "damageTaken",
  "tempHp",
  "deathSaves",
  "expendedHitDice",
  "isSetupComplete",
  "startingEquipmentSelections",
  "startingEquipmentCategorySelections",
] as const satisfies readonly (keyof CharacterState)[];

export const extractSaveData = (state: CharacterState): SavedCharacterData => {
  return Object.fromEntries(
    SAVEABLE_STATE_KEYS.map((key) => [key, state[key]]),
  ) as SavedCharacterData;
};

export const validateAndDeserialize = (
  json: string,
): SavedCharacterFileResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse error";
    return { success: false, error: `Invalid JSON: ${message}` };
  }

  const result = savedCharacterFileSchema.safeParse(parsed);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((issue) => issue.message).join("; "),
    };
  }

  return { success: true, data: result.data as SavedCharacterFile };
};

export const migrateIfNeeded = (
  data: SavedCharacterFile,
): SavedCharacterFile => {
  switch (data.schemaVersion) {
    case CURRENT_SCHEMA_VERSION:
      return data;
    default:
      return {
        ...data,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
  }
};

export const serializeCharacter = (state: CharacterState): string => {
  const file: SavedCharacterFile = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    appVersion: CURRENT_APP_VERSION,
    character: extractSaveData(state),
  };

  return JSON.stringify(file, null, 2);
};