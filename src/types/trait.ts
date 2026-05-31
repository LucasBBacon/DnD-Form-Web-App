import type { Ability, Size, Skill } from "./common";
import type { Predicate } from "./predicate";

export type ProficiencyCategory =
  | "armor"
  | "weapons"
  | "tools"
  | "saving_throws"
  | "skills"
  | "languages";

export type SpellPreparationType = "known" | "prepared" | "pact";

export type SpellSchool =
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "illusion"
  | "necromancy"
  | "transmutation";

export interface SpellcastingProgressionPayload {
  /** Number of cantrips known at this level */
  cantripsKnown?: number;
  /** Number of spells known at this level */
  spellsKnown?: number;
  /** Spell slots available at this level */
  spellSlots?: Record<number, number>;
  /** Bonus spells granted at this level */
  bonusSpells?: string[];
  /** Spells added to the spell list at this level */
  spellsAddedToList?: string[];
  /** Number of free spell slots for a specific school at this level */
  freeSchoolSpellSlots?: number;
}

export interface SpellcastingProgressionEntry extends SpellcastingProgressionPayload {
  /** Level at which this progression entry applies */
  level: number;
}

export interface TraitSpellcastingDefinition {
  /** Ability used for spellcasting (e.g., "intelligence") */
  ability: Ability;
  /** Type of spell preparation (e.g., "known", "prepared", "pact") */
  preparationType: SpellPreparationType;
  /** Whether the spellcasting trait allows ritual casting */
  ritualCasting: boolean;
  /** Restrictions on the schools of magic that can be used */
  schoolRestrictions?: SpellSchool[];
  /** Sources for the spell list */
  spellListSource?: string[];
  /** Progression of spellcasting abilities by level */
  progressionByLevel: SpellcastingProgressionEntry[];
}

export type SpellcastingProgression = SpellcastingProgressionPayload | null;

export interface TraitEffect {
  /** Type of effect this trait has, e.g., granting a spell, providing advantage on saves, etc. */
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
  /** Level at which this effect becomes available */
  levelAvailable?: number;
  /** Target of the effect, such as a spell ID or stat key */
  target?: string; // For spell_grant and non-proficiency effects, this is the target key or spell id.
  /** Value associated with the effect, such as a bonus amount */
  value?: number | string | boolean;
  /** Category of proficiency affected by the effect */
  category?: ProficiencyCategory; // For proficiency/proficiency_choice effects.
  /** Specific item affected by the effect */
  item?: string; // For proficiency effects.
  /** Ability used specifically for this spell */
  spellcastingAbility?: Ability;
  /** Uses of the effect, including count and reset conditions */
  uses?: {
    /** Number of uses available */
    count: number | string;
    /** Condition under which the uses reset */
    reset: "short_rest" | "long_rest" | "turn" | "other";
  };
  /** Predicates that must be met for the effect to apply */
  predicates?: Predicate[];
  /** Choice options for the effect */
  choice?: {
    /** Number of choices available */
    count: number;
    /** Pool of options to choose from */
    pool: Skill[] | Ability[] | string[] | "any";
    /** Bonus associated with the choice */
    bonus?: number;
  };
}

export type TraitSizeValue = Size;

export interface TraitData {
  /** Unique identifier for the trait e.g., 'trait_darkvision', 'trait_fey_ancestry' */
  id: string;
  /** Name of the trait e.g., 'Darkvision', 'Fey Ancestry' */
  name: string;
  /** Whether this trait is granted as a starting proficiency */
  isStartingProficiency?: boolean;
  /** Spellcasting details if this trait grants spellcasting abilities */
  spellcasting?: TraitSpellcastingDefinition;
  /** Effects granted by this trait */
  lore: {
    /** Short description of the trait e.g., "You can see in dim light within 60 feet as if it were bright light..." */
    shortDescription: string;
    /** Full text description of the trait */
    fullText?: string;
  };
  /** Effects granted by the trait, such as bonuses, proficiencies, or special abilities */
  effects?: TraitEffect[];
}

export type TraitSourceKind =
  | "race"
  | "subrace"
  | "class"
  | "subclass"
  | "feat";

export interface TraitSource {
  /** Kind of source for the trait, e.g., race, class, feat */
  kind: TraitSourceKind;
  /** Label for the source, e.g., "Elf", "Wizard", "Sharpshooter" */
  label: string;
  /** Optional identifier for the source */
  sourceId?: string;
  /** Optional name of the source */
  sourceName?: string;
  /** Optional level at which the trait is gained */
  level?: number;
}

export interface SourcedTrait {
  /** Trait data along with its sources */
  trait: TraitData;
  /** Sources from which the trait is derived */
  sources: TraitSource[];
}
