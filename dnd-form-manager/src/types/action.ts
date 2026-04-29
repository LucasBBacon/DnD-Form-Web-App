import type { Ability } from "./common";

export type ActionType =
  | "action"
  | "bonus_action"
  | "reaction"
  | "legendary_action"
  | "special"
  | "minute"
  | "hour";

export type ActionRangeType = "self" | "touch" | "ranged" | "sight" | "unlimited";

export interface ActionData {
  id: string;
  name: string;
  description?: string;
  activation: {
    actionType: ActionType;
    condition?: string;
  };
  range: {
    type: ActionRangeType;
    distance?: number;
    maxDistance?: number;
  };
  areaOfEffect?: {
    shape: "cone" | "cube" | "cylinder" | "line" | "sphere";
    size: number;
  };
  attackRoll?: {
    ability: Ability | "finesse" | "spellcasting";
    includeProficiency?: boolean;
  };
  savingThrow?: {
    ability: Ability;
    dcCalculation: {
      base: number;
      includeProficiency?: boolean;
      modifierStat: Ability;
    };
    onSave: "half_damage" | "no_damage" | "special";
  };
  output?: {
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
  };
}
