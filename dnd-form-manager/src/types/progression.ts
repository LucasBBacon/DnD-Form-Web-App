import type { Ability, Skill } from "./common";

export interface LevelChoice {
  hpGained?: number; // Raw roll on the hit die
  // levels where an Ability Score Increase is reached
  asiChoices?: Partial<Record<Ability, number>>;
  // Opted for a Feat instead of an ASI
  featId?: string;
  // Class-specific options granted at this level
  featureChoices?: Record<string, string>;

  skillChoices?: Skill[];
  expertiseChoices?: Skill[];
}
