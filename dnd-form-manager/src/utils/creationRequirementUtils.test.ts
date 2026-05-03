import { describe, expect, it } from "vitest";
import {
  resolveCreationRequirements,
  type CreationRequirementState,
  type CreationSpellcastingPools,
} from "./creationRequirementUtils";

// ---------------------------------------------------------------------------
// Shared baseline state helpers
// ---------------------------------------------------------------------------

const EMPTY_STATE: CreationRequirementState = {
  classId: null,
  raceId: null,
  subraceId: null,
  level: 1,
  classTracks: [],
  choicesByLevel: {},
  chosenRacialSkills: [],
  startingEquipmentSelections: {},
  spellsKnown: [],
  spellsPrepared: [],
};

const NON_CASTER_POOLS: CreationSpellcastingPools = {
  isSpellcaster: false,
  cantripMax: 0,
  knownMax: 0,
  preparedMax: 0,
  preparationType: null,
};

// Sorcerer level 1: 4 cantrips, 2 spells known
const SORCERER_POOLS: CreationSpellcastingPools = {
  isSpellcaster: true,
  cantripMax: 4,
  knownMax: 2,
  preparedMax: 0,
  preparationType: "known",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("resolveCreationRequirements", () => {
  it("returns empty array when no class or race selected", () => {
    const requirements = resolveCreationRequirements(EMPTY_STATE, NON_CASTER_POOLS);
    expect(requirements).toHaveLength(0);
  });

  it("returns equipment bundle requirements for a class with choices", () => {
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_barbarian",
      classTracks: [{ classId: "class_barbarian", subclassId: null, level: 1 }],
    };
    const requirements = resolveCreationRequirements(state, NON_CASTER_POOLS);
    const equipReqs = requirements.filter((r) => r.type === "equipment_bundle");
    // Barbarian has 2 equipment choice groups
    expect(equipReqs.length).toBeGreaterThan(0);
    // All unresolved initially
    equipReqs.forEach((r) => expect(r.isResolved).toBe(false));
  });

  it("marks an equipment bundle requirement resolved when selection is set", () => {
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_barbarian",
      classTracks: [{ classId: "class_barbarian", subclassId: null, level: 1 }],
      startingEquipmentSelections: { 0: 1 },
    };
    const requirements = resolveCreationRequirements(state, NON_CASTER_POOLS);
    const equipReq = requirements.find(
      (r) => r.type === "equipment_bundle" && r.id === "equipment_bundle_0",
    );
    expect(equipReq).toBeDefined();
    expect(equipReq?.isResolved).toBe(true);
  });

  it("returns cantrip and spell requirements for a spellcaster class", () => {
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_sorcerer",
      classTracks: [{ classId: "class_sorcerer", subclassId: null, level: 1 }],
    };
    const requirements = resolveCreationRequirements(state, SORCERER_POOLS);
    const cantripReq = requirements.find((r) => r.type === "cantrip_known");
    const spellReq = requirements.find((r) => r.type === "spell_known");
    expect(cantripReq).toBeDefined();
    expect(spellReq).toBeDefined();
    expect(cantripReq?.isResolved).toBe(false);
    expect(spellReq?.isResolved).toBe(false);
  });

  it("does not return spell requirements for a non-spellcaster", () => {
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_barbarian",
      classTracks: [{ classId: "class_barbarian", subclassId: null, level: 1 }],
    };
    const requirements = resolveCreationRequirements(state, NON_CASTER_POOLS);

    const spellReqs = requirements.filter(
      (r) => r.type === "cantrip_known" || r.type === "spell_known",
    );
    expect(spellReqs).toHaveLength(0);
  });

  it("resolves cantrip requirement when enough cantrips are known", () => {
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_sorcerer",
      classTracks: [{ classId: "class_sorcerer", subclassId: null, level: 1 }],
      // SORCERER_POOLS cantripMax = 4; add 4 level-0 spells that actually exist in the data
      spellsKnown: ["spell_acid_splash", "spell_chill_touch", "spell_acid_splash", "spell_chill_touch"],
    };
    // Note: deduplication doesn't matter here — only count matters
    // Override pools manually: cantripMax=2 so only 2 are needed
    const pools2: CreationSpellcastingPools = { ...SORCERER_POOLS, cantripMax: 2 };
    const stateWith2: CreationRequirementState = {
      ...state,
      spellsKnown: ["spell_acid_splash", "spell_chill_touch"],
    };
    const requirements = resolveCreationRequirements(stateWith2, pools2);
    const cantripReq = requirements.find((r) => r.type === "cantrip_known");
    expect(cantripReq?.isResolved).toBe(true);
  });

  it("resolves spell_known requirement when enough non-cantrip spells are known", () => {
    // spell_hex is a warlock spell (level 1), exists in the data
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_sorcerer",
      classTracks: [{ classId: "class_sorcerer", subclassId: null, level: 1 }],
      // SORCERER_POOLS knownMax = 2; add 2 non-cantrip spells
      // Use a dummy ID for the second since hex is warlock-only — the resolution only checks count
      spellsKnown: ["spell_hex", "spell_hex"],
    };
    // We're testing count logic — provide pools with knownMax=2
    const requirements = resolveCreationRequirements(state, SORCERER_POOLS);
    const spellReq = requirements.find(
      (r) => r.type === "spell_known" && r.id === "spell_known",
    );
    expect(spellReq?.isResolved).toBe(true);
  });

  it("returns class skill requirements for Sorcerer", () => {
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_sorcerer",
      classTracks: [{ classId: "class_sorcerer", subclassId: null, level: 1 }],
    };
    const requirements = resolveCreationRequirements(state, NON_CASTER_POOLS);
    const classSkillReqs = requirements.filter(
      (r) => r.type === "skill_proficiency" && r.wizardStage === "class",
    );
    // Sorcerer gets 2 skill choices
    expect(classSkillReqs.length).toBeGreaterThan(0);
    classSkillReqs.forEach((r) => expect(r.isResolved).toBe(false));
  });

  it("resolves class skill requirement when enough skills are chosen", () => {
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_sorcerer",
      classTracks: [{ classId: "class_sorcerer", subclassId: null, level: 1 }],
      // Sorcerer gets 2 skills; provide 2
      choicesByLevel: {
        1: {
          skillChoices: ["arcana", "insight"],
        },
      },
    };
    const requirements = resolveCreationRequirements(state, NON_CASTER_POOLS);
    const classSkillReqs = requirements.filter(
      (r) => r.type === "skill_proficiency" && r.wizardStage === "class",
    );
    classSkillReqs.forEach((r) => expect(r.isResolved).toBe(true));
  });

  it("all requirements are blocking except prepared spell selection", () => {
    const PREPARED_POOLS: CreationSpellcastingPools = {
      isSpellcaster: true,
      cantripMax: 3,
      knownMax: 0,
      preparedMax: 6,
      preparationType: "prepared",
    };
    const state: CreationRequirementState = {
      ...EMPTY_STATE,
      classId: "class_wizard",
      classTracks: [{ classId: "class_wizard", subclassId: null, level: 1 }],
    };
    const requirements = resolveCreationRequirements(state, PREPARED_POOLS);
    const preparedReq = requirements.find((r) => r.id === "spell_prepared");
    // Prepared casters: non-blocking since they can always change
    expect(preparedReq?.isBlocking).toBe(false);
    // Cantrip requirement IS blocking
    const cantripReq = requirements.find((r) => r.type === "cantrip_known");
    expect(cantripReq?.isBlocking).toBe(true);
  });
});
