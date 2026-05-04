import type { Ability, Skill } from "./common";

export type LevelUpStepId =
  | "class_pick"
  | "subclass_pick"
  | "hp_gain"
  | "proficiency_choice"
  | "feature_choice"
  | "asi_or_feat"
  | "spell_choice"
  | "review";

export interface LevelUpDraft {
  /** Class selected for this level-up (null until class_pick step is confirmed). */
  targetClassId: string | null;
  /** true when this level-up adds a brand-new class track (multiclassing in). */
  isNewMulticlass: boolean;
  /** The class-specific level after this level-up (e.g. 4 when Fighter goes 3→4). */
  targetClassLevel: number;

  // ---- per-step choices ----

  /** HP gained this level (null = not yet chosen). */
  hpGained: number | null;
  /** Whether the player wants to use the average roll rather than manual entry. */
  useAverageHp: boolean;

  /** Subclass picked this level (only populated when subclass_pick step runs). */
  newSubclassId: string | null;

  /** Net ability-score points allocated (max 2 total, each ability capped at 20). */
  asiChoices: Partial<Record<Ability, number>>;
  /** Feat chosen instead of ASI (mutually exclusive with asiChoices). */
  featId: string | null;

  skillChoices: Skill[];
  expertiseChoices: Skill[];
  weaponChoices: string[];
  toolChoices: string[];
  languageChoices: string[];
  /** Per-source proficiency picks keyed as `${category}:${sourceId}`. */
  proficiencySelectionsBySource: Record<string, string[]>;

  /** Leveled spells learned this level. */
  spellsLearned: string[];
  /** Cantrips learned this level. */
  cantripsLearned: string[];

  /** Arbitrary feature choices keyed by trait/feature ID. */
  featureChoices: Record<string, string>;

  /** ID of the wizard step the user is currently on. */
  currentStepId: LevelUpStepId;
}

export const createEmptyDraft = (): LevelUpDraft => ({
  targetClassId: null,
  isNewMulticlass: false,
  targetClassLevel: 1,
  hpGained: null,
  useAverageHp: true,
  newSubclassId: null,
  asiChoices: {},
  featId: null,
  skillChoices: [],
  expertiseChoices: [],
  weaponChoices: [],
  toolChoices: [],
  languageChoices: [],
  proficiencySelectionsBySource: {},
  spellsLearned: [],
  cantripsLearned: [],
  featureChoices: {},
  currentStepId: "class_pick",
});
