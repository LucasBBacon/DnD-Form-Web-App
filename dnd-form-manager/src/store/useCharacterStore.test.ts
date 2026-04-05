/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it } from "vitest";
import { useCharacterStore } from "./useCharacterStore";

describe("useCharacterStore feat acquisition state", () => {
  beforeEach(() => {
    useCharacterStore.setState({
      level: 5,
      raceId: null,
      subraceId: null,
      classId: null,
      subclassId: null,
      choicesByLevel: {},
      acquiredFeats: [],
    } as any);
  });

  it("syncs level-up feat acquisition when updating level choices", () => {
    useCharacterStore.getState().updateLevelChoice(4, { featId: "feat_alert" });

    expect(useCharacterStore.getState().choicesByLevel[4].featId).toBe(
      "feat_alert",
    );
    expect(useCharacterStore.getState().acquiredFeats).toEqual([
      {
        featId: "feat_alert",
        source: "level_up",
        sourceLevel: 4,
      },
    ]);
  });

  it("prunes level-up acquired feats above the current level when leveling down", () => {
    useCharacterStore.setState({
      acquiredFeats: [
        { featId: "feat_alert", source: "level_up", sourceLevel: 4 },
        { featId: "feat_mobile", source: "level_up", sourceLevel: 6 },
        { featId: "feat_gifted_mind", source: "origin", sourceLevel: 1 },
      ],
      choicesByLevel: {
        4: { featId: "feat_alert" },
        6: { featId: "feat_mobile" },
      },
      level: 6,
    } as any);

    useCharacterStore.getState().setLevel(4);

    expect(useCharacterStore.getState().acquiredFeats).toEqual([
      { featId: "feat_alert", source: "level_up", sourceLevel: 4 },
      { featId: "feat_gifted_mind", source: "origin", sourceLevel: 1 },
    ]);
  });

  it("clears origin acquired feats on upstream race or class identity changes", () => {
    useCharacterStore.setState({
      acquiredFeats: [
        { featId: "feat_gifted_mind", source: "origin", sourceLevel: 1 },
        { featId: "feat_alert", source: "level_up", sourceLevel: 4 },
      ],
    } as any);

    useCharacterStore.getState().setRace("race_elf");
    expect(useCharacterStore.getState().acquiredFeats).toEqual([
      { featId: "feat_alert", source: "level_up", sourceLevel: 4 },
    ]);

    useCharacterStore.setState({
      acquiredFeats: [
        { featId: "feat_gifted_mind", source: "origin", sourceLevel: 1 },
        { featId: "feat_alert", source: "level_up", sourceLevel: 4 },
      ],
    } as any);

    useCharacterStore.getState().setClass("class_fighter");
    expect(useCharacterStore.getState().acquiredFeats).toEqual([
      { featId: "feat_alert", source: "level_up", sourceLevel: 4 },
    ]);
  });
});