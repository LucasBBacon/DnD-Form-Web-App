/**
 * Identifies which wizard stage a requirement belongs to.
 * Must stay in sync with WIZARD_STEPS ids in CharacterCreationWizard.tsx.
 */
export type WizardStageId =
  | "race"
  | "class"
  | "spells"
  | "abilities"
  | "background"
  | "equipment"
  | "identity";

/** 
 * Base properties for all character creation requirements, which are used to track progress and enforce blocking rules in the UI. 
 * Each specific requirement type then extends this with its own relevant properties.
 */
interface CreationRequirementBase {
  /** Stable unique id for this requirement, e.g. "equipment_bundle_0". */
  id: string;
  /** The wizard stage this requirement must be resolved in. */
  wizardStage: WizardStageId;
  /** Human-readable label shown in progress chips. */
  label: string;
  /** When true, the user cannot advance past this stage until resolved. */
  isBlocking: boolean;
  /** Whether the current state satisfies this requirement. */
  isResolved: boolean;
}

// #region Abilities

export interface AbilityAssignmentRequirement extends CreationRequirementBase {
  type: "ability_assignment";
  /** The method used for ability score assignment. */
  method: "rolling" | "standard_array" | "point_buy";
  /** True when point-buy validation failed but explicit override is enabled. */
  usesOverride?: boolean;
  /** Helpful debug/details string for UI summaries and tests. */
  detail?: string;
}

// #endregion

// #region Equipment

export interface EquipmentBundleRequirement extends CreationRequirementBase {
  type: "equipment_bundle";
  /** Index into classData.startingEquipment.choices */
  groupIndex: number;
  /** Number of bundles to pick (always 1 per group in 5e). */
  chooseCount: number;
  /** Item ID lists per selectable option. */
  options: Array<{ itemIds: string[] }>;
}

// #endregion

// #region Spells

export interface CantripKnownRequirement extends CreationRequirementBase {
  type: "cantrip_known";
  /** Number of cantrips required. */
  required: number;
  /** Number of cantrips currently known. */
  current: number;
  /** Class IDs whose spell list should be shown in the picker. */
  classIds: string[];
}

export interface SpellKnownRequirement extends CreationRequirementBase {
  type: "spell_known";
  /** The method used for spell preparation. */
  preparationType: "known" | "prepared" | "pact";
  /** Number of spells required. */
  required: number;
  /** Number of spells currently known. */
  current: number;
  /** Class IDs whose spell list should be shown in the picker. */
  classIds: string[];
}

// #endregion

// #region Skills / Proficiencies

export interface SkillProficiencyRequirement extends CreationRequirementBase {
  type: "skill_proficiency";
  /** Trait or feature that grants this pick (for grouping in the UI). */
  sourceId: string;
  /** Human-readable name of the source trait or feature. */
  sourceName: string;
  /** Number of skills required. */
  required: number;
  /** List of skills available for selection. */
  pool: string[];
  /** List of skills currently selected. */
  current: string[];
}

// #endregion

// #region Union

export type CreationRequirement =
  | AbilityAssignmentRequirement
  | EquipmentBundleRequirement
  | CantripKnownRequirement
  | SpellKnownRequirement
  | SkillProficiencyRequirement;

// #endregion
