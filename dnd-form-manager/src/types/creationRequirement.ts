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
  required: number;
  current: number;
  /** Class IDs whose spell list should be shown in the picker. */
  classIds: string[];
}

export interface SpellKnownRequirement extends CreationRequirementBase {
  type: "spell_known";
  preparationType: "known" | "prepared" | "pact";
  required: number;
  current: number;
  classIds: string[];
}

// #endregion

// #region Skills / Proficiencies

export interface SkillProficiencyRequirement extends CreationRequirementBase {
  type: "skill_proficiency";
  /** Trait or feature that grants this pick (for grouping in the UI). */
  sourceId: string;
  sourceName: string;
  required: number;
  pool: string[];
  current: string[];
}

// #endregion

// #region Union

export type CreationRequirement =
  | EquipmentBundleRequirement
  | CantripKnownRequirement
  | SpellKnownRequirement
  | SkillProficiencyRequirement;

// #endregion
