import type { Ability, Skill } from "./common";

export type LevelUpMode = "xp_gated" | "milestone_anytime";

export interface LevelChoice {
  selectedClassId?: string;
  hpGained?: number; // Raw roll on the hit die
  // levels where an Ability Score Increase is reached
  asiChoices?: Partial<Record<Ability, number>>;
  // Opted for a Feat instead of an ASI
  featId?: string;
  // Class-specific options granted at this level
  featureChoices?: Record<string, string>;

  skillChoices?: Skill[];
  expertiseChoices?: Skill[];
  weaponChoices?: string[];
  toolChoices?: string[];
  languageChoices?: string[];
}
