import type { Ability } from "./common";
import type { UUID } from "./common";
import type { WeaponPropertyCatalogEntry, WeaponRangeBand } from "./item";

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

/**
 * Represents a weapon attack derived from an equipped weapon.
 * Phase 8 Enhancement: Includes versatile mode, range selection, reach handling, heavy weapon disadvantage, and thrown variants.
 */
export interface Attack {
  /** Instance ID of the equipped weapon, if applicable */
  instanceId: UUID | null;
  /** Base item ID of the weapon */
  weaponId: string;
  /** Display name of the weapon (customName or base name) */
  name: string;
  /** To-hit modifier for the attack */
  toHit: number;
  /** Formatted damage string (e.g., "1d8 + 2 slashing") */
  damageString: string;
  /** Catalog entries for weapon properties (finesse, reach, etc.) */
  properties: WeaponPropertyCatalogEntry[];
  /** Display range string for the weapon (e.g., "5 ft", "60/120 ft") */
  range: string;
  /** Parsed range band data for ranged attacks */
  rangeInfo?: WeaponRangeBand;
  /** Melee reach in feet for melee attacks (default: 5 ft) */
  meleeReachFeet: number;
  /** True when the weapon has the reach property */
  hasReachProperty: boolean;
  /** Versatile damage dice string (e.g., "1d10"), if the weapon supports versatile use */
  versatileDamageDice: string | null;
  /** Versatile mode selection (Phase 8): one-handed or two-handed */
  versatileMode: "one-handed" | "two-handed";
  /** Ammunition info for ranged attacks requiring ammunition */
  ammo: { id: string; name: string | null; count: number | null } | null;
  /** Whether the attack can be made (false if exhausted or out of ammo) */
  canAttack: boolean;
  /** True when a small character wields a heavy weapon (locked to disadvantage) */
  heavyDisadvantage: boolean;
  /** True when this attack represents a thrown variant of a melee weapon */
  isThrown: boolean;
  /** Base item id consumed when this thrown attack is used */
  throwableItemId?: string;
  /** Remaining count for the throwable source, when countable */
  throwableCount?: number | null;
}
