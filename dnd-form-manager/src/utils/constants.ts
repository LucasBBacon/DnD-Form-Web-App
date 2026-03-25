import type { Ability, Skill } from "../types/common";

export const MECHANIC_IDS = {
  ASI: "trait_ability_score_improvement",
  JACK_ALL_TRADES: "trait_jack_of_all_trades",
  SPELLCASTING: "trait_spellcasting",
};

export const SKILL_ABILITY_MAP: Record<Skill, Ability> = {
  acrobatics: "dex",
  animal_handling: "wis",
  arcana: "int",
  athletics: "str",
  deception: "cha",
  history: "int",
  insight: "wis",
  intimidation: "cha",
  investigation: "int",
  medicine: "wis",
  nature: "int",
  perception: "wis",
  performance: "cha",
  persuasion: "cha",
  religion: "int",
  sleight_of_hand: "dex",
  stealth: "dex",
  survival: "wis",
};
