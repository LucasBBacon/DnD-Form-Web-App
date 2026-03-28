import type { Ability } from "./common";
import type { Predicate } from "./predicate";

export interface TraitEffect {
  type:
    | "sense"
    | "proficiency"
    | "spell_grant"
    | "stat_modifier"
    | "ac_calculation"
    | "other"; // TODO: further additions in accordance to old schema
  level_available?: number;
  target?: string; // For spell_grant, this is the spellId (e.g., 'spell_hellish_rebuke')
  spellcasting_ability?: Ability; // The stat used specifically for this spell
  uses?: {
    count: number | string;
    reset: "short_rest" | "long_rest" | "turn" | "other";
  };
  predicates?: Predicate[];
}

export interface TraitData {
  id: string; // e.g., 'trait_darkvision', 'trait_fey_ancestry'
  name: string; // e.g., 'Darkvision', 'Fey Ancestry'
  lore: {
    short_description: string; // e.g., "You can see in dim light ..."
    full_text?: string;
  };
  effects?: TraitEffect[];

  // TODO: Add mechanical hooks like 'grant_skill: "perception"'
}
