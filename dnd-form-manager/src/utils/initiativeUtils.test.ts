import { describe, expect, it } from "vitest";
import { calculateInitiative } from "./initiativeUtils";

describe("calculateInitiative", () => {
  it("returns the Dexterity modifier when no other bonuses apply", () => {
    expect(calculateInitiative(3)).toBe(3);
  });

  it("adds flat initiative bonuses", () => {
    expect(calculateInitiative(2, 5)).toBe(7);
  });

  it("supports negative flat initiative bonuses", () => {
    expect(calculateInitiative(2, -1)).toBe(1);
  });

  it("adds half proficiency for Jack of All Trades rounded down", () => {
    expect(calculateInitiative(2, 0, true, 3)).toBe(3);
  });

  it("stacks flat bonuses with Jack of All Trades", () => {
    expect(calculateInitiative(4, 5, true, 4)).toBe(11);
  });

  it("does not add half proficiency when Jack of All Trades is inactive", () => {
    expect(calculateInitiative(1, 2, false, 6)).toBe(3);
  });
});