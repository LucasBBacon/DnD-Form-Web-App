import type { Ability, HitDie } from "./common";

/**
 * Basic item representation for use in item management groups (inventory, etc).
 * Holds item reference Id and the number of said items.
 */
export interface EquipmentItem {
  itemId: string;
  quantity: number;
}

/**
 * Generic grouped item references, with quantities.
 * Currently used for character creation wizard for starting equipment choice. 
 */
export interface EquipmentChoiceGroup {
  choose: number;
  options: { bundle: EquipmentItem[] }[];
}

/**
 * Payload for basic spellcaster data for a given class definition.
 * Used to check for how spellcasting will be function.
 */
export interface SpellcastingBase {
  ability: Ability;
  preparationType: "known" | "prepared" | "pact";
  ritualCasting: boolean;
}

/**
 * Payload for level spellcasting data for a given class definition.
 * Per class level update for the spellcasting abilities of a given class.
 */
export interface SpellcastingProgressionPayload {
  cantripsKnown?: number;
  spellsKnown?: number;
  spellSlots?: Record<number, number>;
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
  multiclassTraits?: string[];
  startingEquipment: {
    given: EquipmentItem[];
    choices: EquipmentChoiceGroup[];
  };
  spellcastingBase: SpellcastingBase | null;
  subclassInfo: {
    name: string;
    choiceLevel: number;
    optionsPool: string;
    displayLabel?: string;
  };
  progression: ProgressionLevel[];
  lore: {
    shortDescription: string;
    fullText?: string;
    sections?: Array<{ title: string; body: string }>;
  };
}
