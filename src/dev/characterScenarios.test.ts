import { describe, it, expect } from "vitest";
import { buildScenarioState, SCENARIO_NAMES } from "./characterScenarios";
import { BASELINE_CHARACTER_STATE } from "../store/useCharacterStore";

describe("buildScenarioState", () => {
  it("returns null for an unknown scenario name", () => {
    expect(buildScenarioState("does_not_exist")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(buildScenarioState("")).toBeNull();
  });

  it("always sets isSetupComplete to true for every known scenario", () => {
    for (const name of SCENARIO_NAMES) {
      const state = buildScenarioState(name);
      expect(state, `${name} should return a state`).not.toBeNull();
      expect(state!.isSetupComplete, `${name} should have isSetupComplete true`).toBe(true);
    }
  });

  it("merges scenario overrides on top of the baseline for all known scenarios", () => {
    for (const name of SCENARIO_NAMES) {
      const state = buildScenarioState(name)!;
      // Every baseline field should be present
      for (const key of Object.keys(BASELINE_CHARACTER_STATE) as Array<
        keyof typeof BASELINE_CHARACTER_STATE
      >) {
        expect(
          Object.prototype.hasOwnProperty.call(state, key),
          `${name} is missing baseline field: ${key}`,
        ).toBe(true);
      }
    }
  });

  it("fighter_l1 scenario has expected class and race", () => {
    const state = buildScenarioState("fighter_l1")!;
    expect(state.classId).toBe("class_fighter");
    expect(state.raceId).toBe("race_human");
    expect(state.level).toBe(1);
  });

  it("barbarian_l5 scenario has expected subclass and damage taken", () => {
    const state = buildScenarioState("barbarian_l5")!;
    expect(state.classId).toBe("class_barbarian");
    expect(state.subclassId).toBe("subclass_barbarian_berserker");
    expect(state.level).toBe(5);
    expect(state.damageTaken).toBeGreaterThan(0);
  });

  it("wizard_l12 scenario has spells and expended slots", () => {
    const state = buildScenarioState("wizard_l12")!;
    expect(state.classId).toBe("class_wizard");
    expect(state.level).toBe(12);
    expect(state.spellsKnown.length).toBeGreaterThan(0);
    expect(Object.keys(state.expendedSpellSlots).length).toBeGreaterThan(0);
  });

  it("fighter_rogue_mc scenario has two class tracks", () => {
    const state = buildScenarioState("fighter_rogue_mc")!;
    expect(state.classTracks).toHaveLength(2);
    expect(state.level).toBe(8);
  });

  it("warlock_pact_l7 has known spells and expended pact slots", () => {
    const state = buildScenarioState("warlock_pact_l7")!;
    expect(state.classId).toBe("class_warlock");
    expect(state.level).toBe(7);
    expect(state.spellsKnown).toEqual(
      expect.arrayContaining(["spell_chill_touch"]),
    );
    expect(state.expendedPactSlots).toBe(1);
  });

  it("warlock_pact_innate_l7 includes innate feat acquisition", () => {
    const state = buildScenarioState("warlock_pact_innate_l7")!;
    expect(state.acquiredFeats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ featId: "feat_starlit_bloodline" }),
      ]),
    );
  });

  it("wizard_warlock_mixed_innate_l9 includes multiclass tracks and mixed spells", () => {
    const state = buildScenarioState("wizard_warlock_mixed_innate_l9")!;
    expect(state.classTracks).toHaveLength(2);
    expect(state.level).toBe(9);
    expect(state.spellsPrepared).toEqual(
      expect.arrayContaining(["spell_lunar_step", "spell_starfall_seal"]),
    );
    expect(state.acquiredFeats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ featId: "feat_starlit_bloodline" }),
      ]),
    );
  });

  it("near_death scenario has failed death saves", () => {
    const state = buildScenarioState("near_death")!;
    expect(state.deathSaves.failure).toBeGreaterThan(0);
    expect(state.damageTaken).toBeGreaterThan(0);
  });
});
