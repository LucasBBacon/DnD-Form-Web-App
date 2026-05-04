/**
 * Scalar values supported by subclass progression scaling entries.
 * String values are typically ability references (e.g., "dex").
 */
export type SubclassScalingValue = string | number;

/**
 * Stat keys currently consumed by useCharacterStats.
 * Additional keys are allowed for future subclass mechanics but must be scalar.
 */
export type KnownSubclassStatScalingKey =
  | "initiative"
  | "initiative_bonus"
  | "ac"
  | "armor_class"
  | "speed";

/**
 * Generic subclass scaling map used in progression entries.
 * When merged across levels, higher-level entries override lower-level keys.
 */
export type SubclassSpecificScaling = Record<string, SubclassScalingValue>;

export interface SubclassProgressionLevel {
  /** Level at which the subclass features are gained e.g., 3 */
  level: number;
  /** Features gained at this level */
  features: string[]; 
  /** Class-specific scaling details for this level */
  subclassSpecificScaling?: SubclassSpecificScaling;

  // Spell IDS automatically learned/prepared (Cleric Domain, Paladin Oath)
  bonusSpells?: string[];

  // Spell IDs added to the class's valid spell list (Warlock Patron)
  spellsAddedToList?: string[];
}

export interface SubclassData {
  /** Unique identifier for the subclass e.g., 'subclass_champion' */
  id: string;
  /** Name of the subclass e.g., 'Champion' */
  name: string;
  /** Unique identifier for the parent class e.g., 'class_fighter' */
  parentClassId: string;

  /** Lore and description of the subclass */
  lore?: {
    /** Short description of the subclass */
    shortDescription: string;
    /** Full text description of the subclass */
    fullText?: string;
  };

  // Only contains items for the specific levels where this subclass grants features
  progression: SubclassProgressionLevel[];
}
