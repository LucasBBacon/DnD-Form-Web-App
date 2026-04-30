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
  vocal: boolean;
  somatic: boolean;
  material: boolean;
  materialMaterials?: string; // e.g., "A pinch of sulfur"
}

export type SpellRangeType = "self" | "touch" | "ranged" | "sight" | "unlimited";

export interface SpellRange {
  type: SpellRangeType;
  distance?: number;
  maxDistance?: number;
}

export interface SpellAreaOfEffect {
  shape: "cone" | "cube" | "cylinder" | "line" | "sphere";
  size: number;
}

export interface SpellSavingThrow {
  ability: Ability;
  dcCalculation: {
    base: number;
    includeProficiency?: boolean;
    modifierStat: Ability | "spellcasting";
  };
  onSave: "half_damage" | "no_damage" | "special";
}

export interface SpellOutput {
  damage?: Array<{
    type: string;
    roll: string;
    addModifier?: boolean;
    scaling?: {
      type: "character_level" | "class_level" | "spell_slot";
      thresholds?: Record<string, string>;
    };
  }>;
  healing?: string[];
}

export interface SpellRawData {
  id: string;
  name: string;
  level: number;
  school: SpellSchool;
  classes: string[];
  actionType: SpellActionType;
  section?: "action" | "bonus_action" | "reaction";
  range: SpellRange;
  areaOfEffect?: SpellAreaOfEffect;
  savingThrow?: SpellSavingThrow;
  output?: SpellOutput;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  components: SpellComponents;
  lore: {
    shortDescription: string;
    fullText: string;
    higherLevel?: string;
  };
}

export interface SpellData {
  id: string; // e.g., 'spell_fireball'
  name: string; // e.g., 'Fireball'
  level: number; // 0 for cantrips, 1-9 for leveled spells
  school: SpellSchool;

  classes: string[];

  // Optional action-economy tags from schema-driven spell data.
  actionType?: SpellActionType;
  section?: "action" | "bonus_action" | "reaction";
  areaOfEffect?: SpellAreaOfEffect;
  savingThrow?: SpellSavingThrow;
  output?: SpellOutput;

  // Filtering properties
  castingTime: string; // e.g., "1 action", "1 bonus action", "1 minute"
  range: string; // e.g., "150 feet", "Touch", "Self (15-foot cone)"
  duration: string; // e.g., "Instantaneous", "1 hour"
  concentration: boolean;
  ritual: boolean;

  components: SpellComponents;

  lore: {
    shortDescription: string; // "Hurls a fiery bead that explodes..."
    fullText: string;
    higherLevel?: string; // "when you cast this spell using a spell slot of 4th level..."
  };
}
