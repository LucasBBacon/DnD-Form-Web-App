import type { Ability, Size, Skill } from "./common";
import type { Predicate } from "./predicate";

export interface TraitEffect {
  type:
    | "action_grant"
    | "advantage"
    | "disadvantage"
    | "sense"
    | "half_proficiency"
    | "proficiency"
    | "save_proficiency"
    | "proficiency_choice"
    | "expertise"
    | "spell_grant"
    | "stat_modifier"
    | "ability_bonus_fixed"
    | "ability_bonus_choice"
    | "size_set"
    | "ac_calculation"
    | "other"; // TODO: further additions in accordance to old schema
  levelAvailable?: number;
  target?: string; // For spell_grant, this is the spellId (e.g., 'spell_hellish_rebuke')
  value?: number | string | boolean;
  spellcastingAbility?: Ability; // The stat used specifically for this spell
  uses?: {
    count: number | string;
    reset: "short_rest" | "long_rest" | "turn" | "other";
  };
  predicates?: Predicate[];
  choice?: {
    count: number;
    pool: Skill[] | Ability[] | "any";
    bonus?: number;
  };
}

export type TraitSizeValue = Size;

export interface TraitData {
  id: string; // e.g., 'trait_darkvision', 'trait_fey_ancestry'
  name: string; // e.g., 'Darkvision', 'Fey Ancestry'
  lore: {
    shortDescription: string; // e.g., "You can see in dim light ..."
    fullText?: string;
  };
  effects?: TraitEffect[];
}
