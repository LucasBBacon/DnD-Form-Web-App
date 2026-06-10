import type { Ability, Skill } from "./common";

export type LevelUpMode =
  | "xp"
  | "milestone"

export interface LevelChoice {
  /** ID of the selected class for this level */
  selectedClassId?: string;
  /** Hit points gained at this level */
  hpGained?: number; // Raw roll on the hit die
  /** Ability Score Increase choices for this level */
  asiChoices?: Partial<Record<Ability, number>>;
  /** Feat chosen instead of an ASI */
  featId?: string;
  /** Class-specific options granted at this level */
  featureChoices?: Record<string, string>;

  /** Skill choices for this level */
  skillChoices?: Skill[];
  /** Expertise choices for this level */
  expertiseChoices?: Skill[];
  /** Weapon choices for this level */
  weaponChoices?: string[];
  /** Tool choices for this level */
  toolChoices?: string[];
  /** Language choices for this level */
  languageChoices?: string[];
}

export const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000,
  120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];
