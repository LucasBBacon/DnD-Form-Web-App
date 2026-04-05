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
      classTracks: [],
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

  it("seeds class track when setting a class", () => {
    useCharacterStore.getState().setClass("class_wizard");

    expect(useCharacterStore.getState().classTracks).toEqual([
      { classId: "class_wizard", subclassId: null, level: 5 },
    ]);
  });

  it("supports adding and leveling a multiclass track", () => {
    useCharacterStore.getState().setClass("class_fighter");
    useCharacterStore.getState().setLevel(3);
    useCharacterStore.getState().setClassTrackLevel("class_fighter", 3);

    useCharacterStore.getState().addClassTrack("class_wizard", 2);

    expect(useCharacterStore.getState().classTracks).toEqual([
      { classId: "class_fighter", subclassId: null, level: 3 },
      { classId: "class_wizard", subclassId: null, level: 2 },
    ]);
    expect(useCharacterStore.getState().level).toBe(5);
  });

  it("promotes next class track when removing the primary class", () => {
    useCharacterStore.getState().setClassTracks([
      { classId: "class_fighter", subclassId: "subclass_champion", level: 3 },
      { classId: "class_wizard", subclassId: "subclass_evocation", level: 2 },
    ]);

    useCharacterStore.getState().removeClassTrack("class_fighter");

    expect(useCharacterStore.getState().classId).toBe("class_wizard");
    expect(useCharacterStore.getState().subclassId).toBe("subclass_evocation");
    expect(useCharacterStore.getState().level).toBe(2);
  });
});