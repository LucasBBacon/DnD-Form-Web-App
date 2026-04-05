import type { Ability, Size } from "./common";
import type { AbilityBonusChoice } from "./race";

export interface SubraceData {
  id: string; // e.g., 'subrace_elf_high'
  name: string; // e.g., 'High Elf'
  parentRaceId: string; // e.g., 'race_elf'

  // Mirrors base Race schema for easy merging
  abilityBonuses?: {
    fixed?: Partial<Record<Ability, number>>;
    choices?: AbilityBonusChoice[];
  };

  traitsAdded?: string[]; // Traits IDs

  languagesAdded?: {
    known: string[];
    choices?: {
      count: number;
      uniqueChoices?: boolean;
    };
  };

  // If present, these replace the base race's physics
  overrides?: {
    size?: Size;
    speed?: {
      walk?: number;
      fly?: number;
      swim?: number;
      climb?: number;
    };
  };

  lore: {
    shortDescription: string;
    fullText?: string;
    sections?: Array<{ title: string; body: string }>;
  };
}
