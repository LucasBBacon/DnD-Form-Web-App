import type { SpellcastingBase } from "./class";

export interface SubclassProgressionLevel {
    level: number; // e.g., 3
    features: string[]; // Trait IDs
    subclass_specific_scaling?: Record<string, string | number>;

    // Spell IDS automatically learned/prepared (Cleric Domain, Paladin Oath)
    bonus_spells?: string[];
    
    // Spell IDs added to the class's valid spell list (Warlock Patron)
    spells_added_to_list?: string[];

    // Used for eldritch Knight, Arcane Trickster
    spellcasting_progression_additions?: {
        cantrips_known?: number;
        spells_known?: number;
        spell_slots?: Record<number, number>;
    };
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