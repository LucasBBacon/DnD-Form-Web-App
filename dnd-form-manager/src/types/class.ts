import type { Ability, HitDie } from "./common";

export interface EquipmentItem {
  itemId: string;
  quantity: number;
}

export interface EquipmentChoiceGroup {
  choose: number;
  options: { bundle: EquipmentItem[] }[];
}

export interface SpellcastingBase {
  ability: Ability;
  preparationType: "known" | "prepared" | "pact";
  ritualCasting: boolean;
}

export interface SpellcastingProgressionPayload {
  cantripsKnown?: number;
  spellsKnown?: number;
  spellSlots?: Record<number, number>;
}

export interface MulticlassSkillChoice {
  choose: number;
  options?: string[];
}

export interface MulticlassProficiencies {
  armor?: string[];
  weapons?: string[];
  tools?: string[];
  skills?: MulticlassSkillChoice;
}

export type SpellcastingProgression = SpellcastingProgressionPayload | null;

export interface ProgressionLevel {
  level: number;
  features: string[];
  classSpecificScaling?: Record<string, string | number | unknown[]>; // e.g., { sneak_attack: "1d6" }
  spellcastingProgression?: SpellcastingProgression;
}

export interface ClassData {
  id: string;
  name: string;
  hitDie: HitDie;
  proficiencies: {
    weapons?: string[]; // Weapon category IDs
    savingThrows: Ability[];
  };
  startingEquipment: {
    given: EquipmentItem[];
    choices: EquipmentChoiceGroup[];
  };
  spellcastingBase: SpellcastingBase | null;
  multiclassProficiencies?: MulticlassProficiencies;
  subclassInfo: {
    name: string;
    choiceLevel: number;
    optionsPool: string;
  };
  progression: ProgressionLevel[];
  lore: {
    shortDescription: string;
    fullText?: string;
    sections?: Array<{ title: string; body: string }>;
  };
}
