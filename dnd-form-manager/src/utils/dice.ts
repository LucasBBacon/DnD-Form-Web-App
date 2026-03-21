import type { DiceNotation, DiceRoll, DieFace } from "../types/common";

export function parseDiceNotation(notation: DiceNotation): DiceRoll {
  const [count, faces] = notation.split("d").map(Number);
  return {
    count,
    faces: faces as DieFace,
  };
}

export function rollDice(roll: DiceRoll): number {
  let total = 0;
  for (let i = 0; i < roll.count; i++) {
    total += Math.floor(Math.random() * roll.faces) + 1;
  }
  return total + (roll.modifier || 0);
}
