import type { Ability, Size } from "./common";

export interface AbilityBonusChoice {
  bonus: number; // e.g., +2 or +1
  options: Ability[]; // Allowed stats to apply this specific bonus to
}

export interface Race {
  id: string;
  name: string;
  description: string;
  size: Size;
  speed: {
    walk: number;
    fly?: number;
    swim?: number;
    climb?: number;
  };
  ability_bonuses: {
    fixed: Partial<Record<Ability, number>>; // e.g., { dex: 2, cha: 1 }
    choices?: AbilityBonusChoice[];
  };
  languages: {
    known: string[]; // Language IDs
    choices: number; // How many extra
  };
  traits: string[]; // Trait IDs
  subrace_info: {
    options_pool: string; // Subrace grouping ID
  } | null;
}
