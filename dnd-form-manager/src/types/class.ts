import type { Ability, HitDie } from "./common";

export interface EquipmentItem {
  item_id: string;
  quantity: number;
}

export interface EquipmentChoiceGroup {
  choose: number;
  options: { bundle: EquipmentItem[] }[];
}

export interface SpellcastingBase {
  ability: Ability;
  preparation_type: "known" | "prepared" | "pact";
  ritual_casting: boolean;
}

export interface SpellcastingProgressionPayload {
  cantrips_known?: number;
  spells_known?: number;
  spell_slots?: Record<number, number>;
}

export type SpellcastingProgression = SpellcastingProgressionPayload | null;

export interface ProgressionLevel {
  level: number;
  features: string[];
  class_specific_scaling?: Record<string, string | number | unknown[]>; // e.g., { sneak_attack: "1d6" }
  spellcasting_progression?: SpellcastingProgression;
}

export interface ClassData {
  id: string;
  name: string;
  hit_die: HitDie;
  proficiencies: {
    weapons?: string[]; // Weapon category IDs
    saving_throws: Ability[];
  };
  starting_equipment: {
    given: EquipmentItem[];
    choices: EquipmentChoiceGroup[];
  };
  spellcasting_base: SpellcastingBase | null;
  subclass_info: {
    name: string;
    choice_level: number;
    options_pool: string;
  };
  progression: ProgressionLevel[];
  lore: {
    short_description: string;
    full_text?: string;
    sections?: Array<{ title: string; body: string }>;
  };
}
