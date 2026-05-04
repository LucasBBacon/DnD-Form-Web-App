import type { Ability } from "./common";

export type ActionType =
  | "action"
  | "bonus_action"
  | "reaction"
  | "legendary_action"
  | "special"
  | "minute"
  | "hour";

export type ActionRangeType =
  | "self"
  | "touch"
  | "ranged"
  | "sight"
  | "unlimited";

/**
 * Represents an action that a character can take, including details about activation, range, area of effect, attack rolls, saving throws, and output such as damage or healing. 
 */
export interface ActionData {
  /** Unique identifier for the action */
  id: string;
  /** Name of the action */
  name: string;
  /** Description of the action */
  description?: string;
  /** Activation details for the action */
  activation: {
    /** Type of action required to activate this action */
    actionType: ActionType;
    /** Optional condition that must be met to activate this action */
    condition?: string;
  };
  /** Range details for the action */
  range: {
    /** Type of range for the action */
    type: ActionRangeType;
    /** Distance for the action, if applicable */
    distance?: number;
    /** Maximum distance for the action, if applicable */
    maxDistance?: number;
  };
  /** Area of effect details for the action */
  areaOfEffect?: {
    /** Shape of the area of effect */
    shape: "cone" | "cube" | "cylinder" | "line" | "sphere";
    /** Size of the area of effect */
    size: number;
  };
  /** Attack roll details for the action */
  attackRoll?: {
    /** Ability used for the attack roll */
    ability: Ability | "finesse" | "spellcasting";
    /** Whether to include proficiency bonus in the attack roll */
    includeProficiency?: boolean;
  };
  /** Saving throw details for the action */
  savingThrow?: {
    /** Ability used for the saving throw */
    ability: Ability;
    /** Details for calculating the saving throw DC */
    dcCalculation: {
      /** Base value for the DC calculation */
      base: number;
      /** Whether to include proficiency bonus in the DC calculation */
      includeProficiency?: boolean;
      /** Ability modifier to use in the DC calculation */
      modifierStat: Ability;
    };
    onSave: "half_damage" | "no_damage" | "special";
  };
  /** Output details for the action */
  output?: {
    /** Damage details for the action */
    damage?: Array<{
      /** Type of damage */
      type: string;
      /** Roll formula for the damage */
      roll: string;
      /** Whether to add the ability modifier to the damage */
      addModifier?: boolean;
      /** Scaling details for the damage */
      scaling?: {
        /** Type of scaling */
        type: "character_level" | "class_level" | "spell_slot";
        /** Thresholds for scaling */
        thresholds?: Record<string, string>;
      };
    }>;
    /** Healing details for the action */
    healing?: string[];
  };
}
