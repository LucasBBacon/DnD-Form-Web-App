import { describe, expect, it } from "vitest";
import {
  getAvailableLevelUpTargetForCharacter,
  getCharacterLevelFromClassTracks,
  getFirstIncompleteLevelChoice,
  isLevelUpAvailableForCharacter,
} from "./levelAvailabilityUtils";

describe("levelAvailabilityUtils", () => {
  it("uses fallback level when class tracks are absent", () => {
    expect(getCharacterLevelFromClassTracks(undefined, 4)).toBe(4);
  });

  it("derives total level from class tracks", () => {
    expect(
      getCharacterLevelFromClassTracks(
        [
          { classId: "class_fighter", subclassId: null, level: 3 },
          { classId: "class_wizard", subclassId: null, level: 2 },
        ],
        1,
      ),
    ).toBe(5);
  });

  it("reports level-up availability from effective class-track level", () => {
    expect(
      isLevelUpAvailableForCharacter({
        xp: 6500,
        level: 1,
        levelUpMode: "xp_gated",
        classTracks: [{ classId: "class_fighter", subclassId: null, level: 4 }],
      }),
    ).toBe(true);
  });

  it("honors milestone mode independently of XP", () => {
    expect(
      isLevelUpAvailableForCharacter({
        xp: 0,
        level: 8,
        levelUpMode: "milestone_anytime",
      }),
    ).toBe(true);
  });

  it("finds the first incomplete saved level choice", () => {
    expect(
      getFirstIncompleteLevelChoice(3, {
        1: { hpGained: 8 },
        3: { hpGained: 6 },
      }),
    ).toBe(2);
  });

  it("returns current incomplete level before opening a new target", () => {
    expect(
      getAvailableLevelUpTargetForCharacter({
        xp: 9999,
        level: 3,
        levelUpMode: "xp_gated",
        choicesByLevel: {
          1: { hpGained: 8 },
          3: { hpGained: 6 },
        },
      }),
    ).toBe(2);
  });

  it("returns next level when XP gating allows a fresh level-up", () => {
    expect(
      getAvailableLevelUpTargetForCharacter({
        xp: 6500,
        level: 4,
        levelUpMode: "xp_gated",
        choicesByLevel: {
          1: { hpGained: 10 },
          2: { hpGained: 7 },
          3: { hpGained: 8 },
          4: { hpGained: 9 },
        },
      }),
    ).toBe(5);
  });

  it("returns next level in milestone mode when current levels are complete", () => {
    expect(
      getAvailableLevelUpTargetForCharacter({
        xp: 0,
        level: 8,
        levelUpMode: "milestone_anytime",
        choicesByLevel: {
          1: { hpGained: 10 },
          2: { hpGained: 7 },
          3: { hpGained: 8 },
          4: { hpGained: 7 },
          5: { hpGained: 8 },
          6: { hpGained: 9 },
          7: { hpGained: 8 },
          8: { hpGained: 9 },
        },
      }),
    ).toBe(9);
  });
});
