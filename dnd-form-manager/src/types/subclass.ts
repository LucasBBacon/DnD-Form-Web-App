import type {
    SpellcastingBase,
    SpellcastingProgression,
} from "./class";

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
    level: number; // e.g., 3
    features: string[]; // Trait IDs
    subclass_specific_scaling?: SubclassSpecificScaling;

    // Spell IDS automatically learned/prepared (Cleric Domain, Paladin Oath)
    bonus_spells?: string[];
    
    // Spell IDs added to the class's valid spell list (Warlock Patron)
    spells_added_to_list?: string[];

    // Used for eldritch Knight, Arcane Trickster
    spellcasting_progression_additions?: SpellcastingProgression;
}

export interface SubclassData {
    id: string; // e.g., 'subclass_champion'
    name: string; // e.g., 'Champion'
    parent_class_id: string; // e.g., 'class_fighter'

    // Overrides the base class casting if necessary
    spellcasting_override?: SpellcastingBase | null;

    // Only contains items for the specific levels where this subclass grants features
    progression: SubclassProgressionLevel[];
}