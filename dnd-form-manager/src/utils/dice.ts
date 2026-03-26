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

export const roll4d6DropLowest = (): number => {
  const rolls = [
    rollDice({ count: 1, faces: 6}),
    rollDice({ count: 1, faces: 6}),
    rollDice({ count: 1, faces: 6}),
    rollDice({ count: 1, faces: 6}),
  ];

  // Sort descending, keep top 3, sum up
  rolls.sort((a, b) => b - a);
  return rolls[0] + rolls[1] + rolls[2];
};
