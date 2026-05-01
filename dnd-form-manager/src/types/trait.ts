import type { Ability, Size, Skill } from "./common";
import type { Predicate } from "./predicate";

export type ProficiencyCategory =
  | "armor"
  | "weapons"
  | "tools"
  | "saving_throws"
  | "skills"
  | "languages";

export interface TraitEffect {
  type:
    | "action_grant"
    | "advantage"
    | "disadvantage"
    | "sense"
    | "half_proficiency"
    | "proficiency"
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
  target?: string; // For spell_grant and non-proficiency effects, this is the target key or spell id.
  value?: number | string | boolean;
  category?: ProficiencyCategory; // For proficiency/proficiency_choice effects.
  item?: string; // For proficiency effects.
  spellcastingAbility?: Ability; // The stat used specifically for this spell
  uses?: {
    count: number | string;
    reset: "short_rest" | "long_rest" | "turn" | "other";
  };
  predicates?: Predicate[];
  choice?: {
    count: number;
    pool: Skill[] | Ability[] | string[] | "any";
    bonus?: number;
  };
}

export type TraitSizeValue = Size;

export interface TraitData {
  id: string; // e.g., 'trait_darkvision', 'trait_fey_ancestry'
  name: string; // e.g., 'Darkvision', 'Fey Ancestry'
  isStartingProficiency?: boolean;
  lore: {
    shortDescription: string; // e.g., "You can see in dim light ..."
    fullText?: string;
  };
  effects?: TraitEffect[];
}

export type TraitSourceKind =
  | "race"
  | "subrace"
  | "class"
  | "subclass"
  | "feat";

export interface TraitSource {
  kind: TraitSourceKind;
  label: string;
  sourceId?: string;
  sourceName?: string;
  level?: number;
}

export interface SourcedTrait {
  trait: TraitData;
  sources: TraitSource[];
}
