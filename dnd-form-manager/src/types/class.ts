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
  itemId: string;
  quantity: number;
}

/**
 * Generic grouped item references, with quantities.
 * Currently used for character creation wizard for starting equipment choice. 
 */
export interface EquipmentChoiceGroup {
  choose: number;
  options: { equipmentBundle: EquipmentItem[] }[];
}

export type { SpellcastingProgression, SpellcastingProgressionPayload };

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
