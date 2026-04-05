import type { Ability, Size } from "./common";

export interface AbilityBonusChoice {
  count: number;
  bonus: number; // e.g., +2 or +1
  pool: Ability[]; // Allowed stats to apply this specific bonus to
}

export interface Race {
  id: string;
  name: string;
  description?: string;
  size: Size;
  speed: {
    walk: number;
    fly?: number;
    swim?: number;
    climb?: number;
  };
  abilityBonuses: {
    fixed: Partial<Record<Ability, number>>; // e.g., { dex: 2, cha: 1 }
    choices?: AbilityBonusChoice[];
  };
  languages: {
    known: string[]; // Language IDs
    choices: number; // How many extra
  };
  traits?: string[]; // Trait IDs
  subraceInfo: {
    optionsPool: string; // Subrace grouping ID
  } | null;
  lore: {
    shortDescription: string;
    fullText?: string;
    sections?: Array<{ title: string; body: string }>;
  };
}
