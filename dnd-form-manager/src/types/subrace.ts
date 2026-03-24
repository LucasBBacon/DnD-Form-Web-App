import type { Ability, Size } from "./common";
import type { AbilityBonusChoice } from "./race";

export interface SubraceData {
  id: string; // e.g., 'subrace_elf_high'
  name: string; // e.g., 'High Elf'
  parent_race_id: string; // e.g., 'race_elf'

  // Mirrors base Race schema for easy merging
  ability_bonuses?: {
    fixed?: Partial<Record<Ability, number>>;
    choices?: AbilityBonusChoice[];
  };

  traits_added?: string[]; // Traits IDs

  languages_added?: {
    known: string[];
    choices?: {
      count: number;
      unique_choices?: boolean;
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
    short_description: string;
    full_text?: string;
    sections?: Array<{ title: string; body: string }>;
  };
}
