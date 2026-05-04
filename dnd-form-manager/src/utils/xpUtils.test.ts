import { describe, expect, it } from "vitest";
import { getLevelFromXp, getXpThresholdForLevel, isLevelUpAvailable } from "./xpUtils";

describe("xpUtils", () => {
  it("returns canonical thresholds for key levels", () => {
    expect(getXpThresholdForLevel(1)).toBe(0);
    expect(getXpThresholdForLevel(2)).toBe(300);
    expect(getXpThresholdForLevel(20)).toBe(355000);
  });

  it("clamps threshold lookup levels to 1-20", () => {
    expect(getXpThresholdForLevel(0)).toBe(0);
    expect(getXpThresholdForLevel(99)).toBe(355000);
  });

  it("derives level from XP boundaries", () => {
    expect(getLevelFromXp(-50)).toBe(1);
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(299)).toBe(1);
    expect(getLevelFromXp(300)).toBe(2);
    expect(getLevelFromXp(6499)).toBe(4);
    expect(getLevelFromXp(355000)).toBe(20);
  });

  it("gates level-up by XP in xp_gated mode", () => {
    expect(isLevelUpAvailable(299, 1, "xp_gated")).toBe(false);
    expect(isLevelUpAvailable(300, 1, "xp_gated")).toBe(true);
    expect(isLevelUpAvailable(14000, 5, "xp_gated")).toBe(true);
  });

  it("allows level-up at any time in milestone mode", () => {
    expect(isLevelUpAvailable(0, 1, "milestone_anytime")).toBe(true);
    expect(isLevelUpAvailable(1, 19, "milestone_anytime")).toBe(true);
  });

  it("never allows level-up at max level", () => {
    expect(isLevelUpAvailable(999999, 20, "xp_gated")).toBe(false);
    expect(isLevelUpAvailable(999999, 20, "milestone_anytime")).toBe(false);
  });
});
