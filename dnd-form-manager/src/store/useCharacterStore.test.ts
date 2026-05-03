/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it } from "vitest";
import { useCharacterStore, BASELINE_CHARACTER_STATE } from "./useCharacterStore";

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

describe("useCharacterStore hydrateCharacter and resetCharacter", () => {
  beforeEach(() => {
    useCharacterStore.setState({ ...BASELINE_CHARACTER_STATE } as any);
  });

  it("hydrateCharacter merges overrides onto baseline and sets isSetupComplete", () => {
    useCharacterStore.getState().hydrateCharacter({
      name: "Scenario Hero",
      level: 7,
      raceId: "race_elf",
      classId: "class_wizard",
    });

    const state = useCharacterStore.getState();
    expect(state.name).toBe("Scenario Hero");
    expect(state.level).toBe(7);
    expect(state.raceId).toBe("race_elf");
    expect(state.classId).toBe("class_wizard");
    expect(state.isSetupComplete).toBe(true);
    // Unspecified fields remain at baseline values
    expect(state.damageTaken).toBe(0);
    expect(state.baseAbilityScores).toEqual(BASELINE_CHARACTER_STATE.baseAbilityScores);
  });

  it("hydrateCharacter always forces isSetupComplete true even when override passes false", () => {
    useCharacterStore.getState().hydrateCharacter({ isSetupComplete: false } as any);
    expect(useCharacterStore.getState().isSetupComplete).toBe(true);
  });

  it("hydrateCharacter preserves existing UUID inventory when no legacy fields are present", () => {
    const instanceId = useCharacterStore.getState().createItemInstance("item_weapon_club")[0];
    useCharacterStore.getState().equipWeaponInstance(instanceId);

    useCharacterStore.getState().hydrateCharacter({
      inventoryInstances: [{ instanceId, baseItemId: "item_weapon_club" }],
      equippedWeaponInstanceIds: [instanceId],
    });

    const state = useCharacterStore.getState();
    expect(state.inventoryInstances).toHaveLength(1);
    expect(state.inventoryInstances[0].instanceId).toBe(instanceId);
    expect(state.equippedWeaponInstanceIds).toContain(instanceId);
  });

  it("enforces an attunement cap of 3 instance IDs", () => {
    const ids = useCharacterStore.getState().createItemInstance("item_weapon_club", 4);

    useCharacterStore.getState().attuneInstance(ids[0]);
    useCharacterStore.getState().attuneInstance(ids[1]);
    useCharacterStore.getState().attuneInstance(ids[2]);
    useCharacterStore.getState().attuneInstance(ids[3]);

    expect(useCharacterStore.getState().attunedInstanceIds).toEqual([ids[0], ids[1], ids[2]]);
  });

  it("resetCharacter returns the store to the full baseline", () => {
    useCharacterStore.getState().hydrateCharacter({
      name: "Dirty State",
      level: 12,
      raceId: "race_dwarf",
      damageTaken: 50,
      tempHp: 10,
      spellsKnown: ["spell_acid_splash"],
    });

    useCharacterStore.getState().resetCharacter();

    const state = useCharacterStore.getState();
    expect(state.name).toBe(BASELINE_CHARACTER_STATE.name);
    expect(state.level).toBe(BASELINE_CHARACTER_STATE.level);
    expect(state.raceId).toBe(BASELINE_CHARACTER_STATE.raceId);
    expect(state.damageTaken).toBe(0);
    expect(state.tempHp).toBe(0);
    expect(state.spellsKnown).toEqual([]);
    expect(state.isSetupComplete).toBe(false);
  });
});

describe("useCharacterStore inventory instance actions", () => {
  beforeEach(() => {
    useCharacterStore.setState({ ...BASELINE_CHARACTER_STATE } as any);
  });

  it("removeInventoryInstance removes only the targeted instance by instanceId", () => {
    const [id1, id2] = useCharacterStore
      .getState()
      .createItemInstance("item_weapon_club", 2);

    useCharacterStore.getState().removeInventoryInstance(id1);

    const state = useCharacterStore.getState();
    expect(state.inventoryInstances).toHaveLength(1);
    expect(state.inventoryInstances[0].instanceId).toBe(id2);
  });

  it("removeInventoryInstance clears equipped armor ref when that instance is dropped", () => {
    const [id] = useCharacterStore
      .getState()
      .createItemInstance("item_armor_leather", 1);
    useCharacterStore.getState().equipArmorInstance(id);
    expect(useCharacterStore.getState().equippedArmorInstanceId).toBe(id);

    useCharacterStore.getState().removeInventoryInstance(id);

    expect(useCharacterStore.getState().equippedArmorInstanceId).toBeNull();
  });

  it("removeInventoryInstance does not clear equipped armor ref when a different instance is dropped", () => {
    const [id1, id2] = useCharacterStore
      .getState()
      .createItemInstance("item_armor_leather", 2);
    useCharacterStore.getState().equipArmorInstance(id1);

    useCharacterStore.getState().removeInventoryInstance(id2);

    expect(useCharacterStore.getState().equippedArmorInstanceId).toBe(id1);
  });

  it("removeInventoryInstance removes the target instance from equippedWeaponInstanceIds", () => {
    const [id1, id2] = useCharacterStore
      .getState()
      .createItemInstance("item_weapon_club", 2);
    useCharacterStore.getState().equipWeaponInstance(id1);
    useCharacterStore.getState().equipWeaponInstance(id2);

    useCharacterStore.getState().removeInventoryInstance(id1);

    expect(useCharacterStore.getState().equippedWeaponInstanceIds).toEqual([id2]);
  });

  it("removeInventoryInstance clears attunement for the dropped instance only", () => {
    const [id1, id2] = useCharacterStore
      .getState()
      .createItemInstance("item_weapon_club", 2);
    useCharacterStore.getState().attuneInstance(id1);
    useCharacterStore.getState().attuneInstance(id2);

    useCharacterStore.getState().removeInventoryInstance(id1);

    expect(useCharacterStore.getState().attunedInstanceIds).toEqual([id2]);
  });

  it("addInventoryItem for instance-mode items creates one record per call and does not merge into quantity", () => {
    useCharacterStore.getState().addInventoryItem("item_weapon_club", 1);
    expect(useCharacterStore.getState().inventoryInstances).toHaveLength(1);

    useCharacterStore.getState().addInventoryItem("item_weapon_club", 1);
    expect(useCharacterStore.getState().inventoryInstances).toHaveLength(2);

    // Both records should have unique instanceIds
    const ids = useCharacterStore
      .getState()
      .inventoryInstances.map((i) => i.instanceId);
    expect(new Set(ids).size).toBe(2);
  });

  it("hydrateCharacter deduplicates instance records with identical instanceIds", () => {
    const sharedId = "test-uuid-dupe";
    useCharacterStore.getState().hydrateCharacter({
      inventoryInstances: [
        { instanceId: sharedId, baseItemId: "item_weapon_club" },
        { instanceId: sharedId, baseItemId: "item_weapon_club" },
        { instanceId: "test-uuid-other", baseItemId: "item_weapon_dagger" },
      ],
    } as any);

    expect(useCharacterStore.getState().inventoryInstances).toHaveLength(2);
  });

  it("hydrateCharacter preserves equipped ref after deduplication when instanceId still exists", () => {
    const duplicateId = "dupe-uuid";
    useCharacterStore.getState().hydrateCharacter({
      inventoryInstances: [
        { instanceId: duplicateId, baseItemId: "item_armor_leather" },
        { instanceId: duplicateId, baseItemId: "item_armor_leather" },
      ],
      equippedArmorInstanceId: duplicateId,
    } as any);

    // Instance survives (deduplicated to 1), equipped ref must be preserved
    expect(useCharacterStore.getState().inventoryInstances).toHaveLength(1);
    expect(useCharacterStore.getState().equippedArmorInstanceId).toBe(duplicateId);
  });

  it("hydrateCharacter reclassifies instance-mode items from inventoryStacks to inventoryInstances", () => {
    useCharacterStore.getState().hydrateCharacter({
      inventoryStacks: [
        { stackId: "stack-backpack", baseItemId: "item_backpack", quantity: 1 },
        { stackId: "stack-torch", baseItemId: "item_torch", quantity: 5 },
      ],
    } as any);

    const state = useCharacterStore.getState();
    // Backpack (instance-mode) must move to inventoryInstances
    expect(state.inventoryStacks).toHaveLength(1);
    expect(state.inventoryStacks[0].baseItemId).toBe("item_torch");
    expect(state.inventoryInstances).toHaveLength(1);
    expect(state.inventoryInstances[0].baseItemId).toBe("item_backpack");
  });

  it("hydrateCharacter expands instance-mode stacks with quantity > 1 into separate instance records", () => {
    useCharacterStore.getState().hydrateCharacter({
      inventoryStacks: [
        { stackId: "stack-backpack", baseItemId: "item_backpack", quantity: 3 },
      ],
    } as any);

    const state = useCharacterStore.getState();
    expect(state.inventoryStacks).toHaveLength(0);
    expect(state.inventoryInstances).toHaveLength(3);
    expect(state.inventoryInstances.every((i) => i.baseItemId === "item_backpack")).toBe(true);
    // Each reclassified record must have a unique instanceId
    const ids = state.inventoryInstances.map((i) => i.instanceId);
    expect(new Set(ids).size).toBe(3);
  });
});

describe("useCharacterStore free-school designation actions", () => {
  beforeEach(() => {
    useCharacterStore.getState().resetCharacter();
  });

  it("designateFreeSchoolSpell adds a spell id; duplicate call is a no-op", () => {
    useCharacterStore.getState().designateFreeSchoolSpell("spell_shield");
    useCharacterStore.getState().designateFreeSchoolSpell("spell_shield");
    expect(useCharacterStore.getState().freeSchoolKnownSpellIds).toEqual([
      "spell_shield",
    ]);
  });

  it("undesignateFreeSchoolSpell removes the spell id", () => {
    useCharacterStore.getState().designateFreeSchoolSpell("spell_shield");
    useCharacterStore.getState().designateFreeSchoolSpell("spell_fireball");
    useCharacterStore.getState().undesignateFreeSchoolSpell("spell_shield");
    expect(useCharacterStore.getState().freeSchoolKnownSpellIds).toEqual([
      "spell_fireball",
    ]);
  });

  it("trimFreeSchoolDesignations(1) keeps only the first entry when array has 3", () => {
    useCharacterStore.getState().designateFreeSchoolSpell("spell_first");
    useCharacterStore.getState().designateFreeSchoolSpell("spell_second");
    useCharacterStore.getState().designateFreeSchoolSpell("spell_third");
    useCharacterStore.getState().trimFreeSchoolDesignations(1);
    expect(useCharacterStore.getState().freeSchoolKnownSpellIds).toEqual([
      "spell_first",
    ]);
  });
});