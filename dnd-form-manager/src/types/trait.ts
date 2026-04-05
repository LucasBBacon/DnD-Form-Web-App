import type { Ability, Skill } from "./common";
import type { Predicate } from "./predicate";

export interface TraitEffect {
  type:
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
    | "ac_calculation"
    | "other"; // TODO: further additions in accordance to old schema
  levelAvailable?: number;
  target?: string; // For spell_grant, this is the spellId (e.g., 'spell_hellish_rebuke')
  value?: number;
  spellcastingAbility?: Ability; // The stat used specifically for this spell
  uses?: {
    count: number | string;
    reset: "short_rest" | "long_rest" | "turn" | "other";
  };
  predicates?: Predicate[];
  choice?: {
    count: number;
    pool: Skill[] | "any";
  };
}

export interface TraitData {
  id: string; // e.g., 'trait_darkvision', 'trait_fey_ancestry'
  name: string; // e.g., 'Darkvision', 'Fey Ancestry'
  lore: {
    shortDescription: string; // e.g., "You can see in dim light ..."
    fullText?: string;
  };
  effects?: TraitEffect[];
}
