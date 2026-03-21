export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type HitDie = 6 | 8 | 10 | 12;
export type Size = "tiny" | "small" | "medium" | "large";

export type Skill =
  | "acrobatics"
  | "animal_handling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleight_of_hand"
  | "stealth"
  | "survival";

export type DieFace = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export type DiceNotation = `${number}d${DieFace}`;

export interface DiceRoll {
  count: number;
  faces: DieFace;
  modifier?: number; // e.g., +2 (for things like 1d8 + 2)
}
