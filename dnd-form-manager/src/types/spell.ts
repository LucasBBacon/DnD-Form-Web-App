import type { Ability } from "./common";

export type SpellSchool =
  | "abjuration"
  | "alteration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy";

export type SpellActionType =
  | "action"
  | "bonus_action"
  | "reaction"
  | "legendary_action"
  | "special"
  | "minute"
  | "hour";

export interface SpellComponents {
  /** Indicates if the spell requires vocal components */
  vocal: boolean;
  /** Indicates if the spell requires somatic components */
  somatic: boolean;
  /** Indicates if the spell requires material components */
  material: boolean;
  /** Description of the material components required, if any */
  materialMaterials?: string; // e.g., "A pinch of sulfur"
}

export type SpellRangeType =
  | "self"
  | "touch"
  | "ranged"
  | "sight"
  | "unlimited";

export interface SpellRange {
  /** Type of range for the spell */
  type: SpellRangeType;
  /** Distance of the spell's range, if applicable */
  distance?: number;
  /** Maximum distance of the spell's range, if applicable */
  maxDistance?: number;
}

export interface SpellAreaOfEffect {
  /** Shape of the area of effect */
  shape: "cone" | "cube" | "cylinder" | "line" | "sphere";
  /** Size of the area of effect */
  size: number;
}

export interface SpellSavingThrow {
  /** Ability used for the saving throw */
  ability: Ability;
  /** Calculation details for the saving throw DC */
  dcCalculation: {
    /** Base value for the DC */
    base: number;
    /** Whether to include proficiency in the DC calculation */
    includeProficiency?: boolean;
    /** Ability or spellcasting modifier used in the DC calculation */
    modifierStat: Ability | "spellcasting";
  };
  /** Effect of the saving throw */
  onSave: "half_damage" | "no_damage" | "special";
}

export interface SpellSlotScalingLinear {
  /** Adds this roll expression for each slot level above the configured start level */
  mode: "linear";
  /** Roll expression to add when upcasting, e.g. "1d8" */
  incrementPerSlotLevel: string;
  /** First slot level where scaling starts. Defaults to base spell level + 1 */
  startAtSlotLevel?: number;
}

export interface SpellSlotScalingTable {
  /** Uses explicit roll expressions per cast slot level */
  mode: "table";
  /** Cast-level to full roll expression map, e.g. { "3": "5d8" } */
  bySlotLevel: Record<string, string>;
}

export type SpellSlotScaling = SpellSlotScalingLinear | SpellSlotScalingTable;

export interface SpellDamageEntry {
  /** Type of damage dealt by the spell */
  type: string;
  /** Dice roll expression for the damage */
  roll: string;
  /** Whether to add the caster's ability modifier to the damage */
  addModifier?: boolean;
  /** Legacy and non-slot scaling information for the damage */
  scaling?: {
    /** Type of scaling */
    type: "character_level" | "class_level" | "spell_slot";
    /** Thresholds for scaling */
    thresholds?: Record<string, string>;
  };
  /** Explicit upcast behavior for slot-level casting */
  slotScaling?: SpellSlotScaling;
}

export interface SpellHealingEntry {
  /** Dice roll expression for the healing */
  roll: string;
  /** Whether to add the caster's spellcasting modifier to the healing */
  addModifier?: boolean;
  /** Legacy and non-slot scaling information for the healing */
  scaling?: {
    /** Type of scaling */
    type: "character_level" | "class_level" | "spell_slot";
    /** Thresholds for scaling */
    thresholds?: Record<string, string>;
  };
  /** Explicit upcast behavior for slot-level casting */
  slotScaling?: SpellSlotScaling;
}

export interface SpellOutput {
  /** Damage dealt by the spell */
  damage?: SpellDamageEntry[];
  /** Healing provided by the spell */
  healing?: SpellHealingEntry[];
}

export interface SpellRawData {
  /** Unique identifier for the spell */
  id: string;
  /** Name of the spell */
  name: string;
  /** Level of the spell (0 for cantrips, 1-9 for leveled spells) */
  level: number;
  /** School of magic for the spell */
  school: SpellSchool;
  /** Classes that can cast the spell */
  classes: string[];
  /** Action type required to cast the spell */
  actionType: SpellActionType;
  /** Section of the action economy the spell belongs to */
  section?: "action" | "bonus_action" | "reaction";
  /** Range of the spell */
  range: SpellRange;
  /** Area of effect of the spell, if applicable */
  areaOfEffect?: SpellAreaOfEffect;
  /** Saving throw information for the spell, if applicable */
  savingThrow?: SpellSavingThrow;
  /** Output of the spell, including damage and healing */
  output?: SpellOutput;
  /** Duration of the spell */
  duration: string;
  /** Whether the spell requires concentration */
  concentration: boolean;
  /** Whether the spell can be cast as a ritual */
  ritual: boolean;
  /** Components required to cast the spell */
  components: SpellComponents;
  /** Lore and description of the spell */
  lore: {
    /** Short description of the spell */
    shortDescription: string;
    /** Full text description of the spell */
    fullText: string;
    /** Description of the spell when cast at higher levels */
    higherLevel?: string;
  };
}

/**
 * Represents a prose-style upcast effect, such as extra targets or rays.
 */
export interface ProseUpcastEffect {
    level: number; // The spell level at which this effect occurs
    description: string; // A prose description of the effect
}

export interface SpellData {
  /** Unique identifier for the spell e.g., 'spell_fireball' */
  id: string;
  /** Name of the spell e.g., 'Fireball' */
  name: string;
  /** Level of the spell (0 for cantrips, 1-9 for leveled spells) */
  level: number;
  /** School of magic for the spell */
  school: SpellSchool;

  /** Classes that can cast the spell */
  classes: string[];

  // Optional action-economy tags from schema-driven spell data.
  /** Action type required to cast the spell */
  actionType?: SpellActionType;
  /** Section of the action economy the spell belongs to */
  section?: "action" | "bonus_action" | "reaction";
  /** Area of effect of the spell, if applicable */
  areaOfEffect?: SpellAreaOfEffect;
  /** Saving throw information for the spell, if applicable */
  savingThrow?: SpellSavingThrow;
  /** Output of the spell, including damage and healing */
  output?: SpellOutput;

  // Filtering properties
  /** Casting time of the spell e.g., "1 action", "1 bonus action", "1 minute" */
  castingTime: string;
  /** Range of the spell e.g., "150 feet", "Touch", "Self (15-foot cone)" */
  range: string;
  /** Duration of the spell e.g., "Instantaneous", "1 hour" */
  duration: string;
  /** Whether the spell requires concentration */
  concentration: boolean;
  /** Whether the spell can be cast as a ritual */
  ritual: boolean;

  /** Components required to cast the spell */
  components: SpellComponents;

  /** Lore and description of the spell */
  lore: {
    /** Short description of the spell */
    shortDescription: string; 
    /** Full text description of the spell */
    fullText: string;
    /** Description of the spell when cast at higher levels */
    higherLevel?: string;
  };
  /** Optional field for prose-style upcast effects */
  proseUpcastEffects?: ProseUpcastEffect[];
}
