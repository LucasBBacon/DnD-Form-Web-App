import type { HitDie } from "./common";
import type {
  SpellcastingProgression,
  SpellcastingProgressionPayload,
} from "./trait";

/**
 * Basic item representation for use in item management groups (inventory, etc).
 * Holds item reference Id and the number of said items.
 */
export interface EquipmentItem {
  /** Unique identifier for the equipment item */
  itemId: string;
  /** Quantity of the equipment item */
  quantity: number;
}

/**
 * Generic grouped item references, with quantities.
 * Currently used for character creation wizard for starting equipment choice.
 */
export interface EquipmentChoiceGroup {
  /** Number of items to choose from the options */
  choose: number;
  /** Options available for selection */
  options: { equipmentBundle: EquipmentItem[] }[];
}

export type { SpellcastingProgression, SpellcastingProgressionPayload };

/**
 * Represents the progression of a class at a specific level, including features gained, class-specific scaling details, and spellcasting progression if applicable.
 */
export interface ProgressionLevel {
  /** Level number for this progression */
  level: number;
  /** Features gained at this level */
  features: string[];
  /** Class-specific scaling details for this level */
  classSpecificScaling?: Record<string, string | number | unknown[]>;
  /** Spellcasting progression details for this level */
  spellcastingProgression?: SpellcastingProgression;
}

/**
 * Represents a character class, including its hit die, starting equipment, subclass information, level progression details, and lore.
 */
export interface ClassData {
  /** Unique identifier for the class */
  id: string;
  /** Name of the class */
  name: string;
  /** Hit die for the class */
  hitDie: HitDie;
  /** Traits available for multiclassing */
  multiclassTraits?: string[];
  /** Starting equipment for the class */
  startingEquipment: {
    /** Equipment items given to the character at the start */
    given: EquipmentItem[];
    /** Equipment choices available to the character at the start */
    choices: EquipmentChoiceGroup[];
  };
  /** Subclass information for the class */
  subclassInfo: {
    /** Level at which the subclass is chosen */
    choiceLevel: number;
    /** Pool of options available for the subclass */
    optionsPool: string;
    /** Display label for the subclass */
    displayLabel?: string;
  };
  /** Progression details for each level of the class */
  progression: ProgressionLevel[];
  /** Lore and descriptive information for the class */
  lore: {
    /** Short description of the class */
    shortDescription: string;
    /** Full text description of the class */
    fullText?: string;
    /** Sections of the class lore */
    sections?: Array<{ title: string; body: string }>;
  };
}
