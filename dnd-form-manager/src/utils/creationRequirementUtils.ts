/**
 * Pure utility for computing which creation-stage requirements are pending and
 * whether they have been satisfied by the current character state.
 *
 * This module is intentionally free of React so it can be unit-tested as a
 * plain function and re-used outside component trees if needed.
 */

import type { Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type {
  CreationRequirement,
  EquipmentBundleRequirement,
  CantripKnownRequirement,
  SpellKnownRequirement,
  SkillProficiencyRequirement,
} from "../types/creationRequirement";
import type { CharacterClassTrack } from "../store/useCharacterStore";
import { getClassById, getRaceById, getSubraceById, getSpellByID } from "../data/staticDataApi";
import { getPendingProficiencyChoices } from "./choiceUtils";

// ---------------------------------------------------------------------------
// Public input types
// ---------------------------------------------------------------------------

/**
 * Spellcasting pools snapshot derived from useSpellcasting(), passed in
 * separately so this utility stays React-free.
 */
export interface CreationSpellcastingPools {
  isSpellcaster: boolean;
  cantripMax: number;
  /** Maximum non-cantrip spells for "known" / "pact" casters. */
  knownMax: number;
  /** Maximum prepared spells for "prepared" casters. */
  preparedMax: number;
  preparationType: "known" | "prepared" | "pact" | null;
}

/**
 * The subset of CharacterState consumed by the requirement engine.
 */
export interface CreationRequirementState {
  classId: string | null;
  raceId: string | null;
  subraceId: string | null;
  level: number;
  classTracks: CharacterClassTrack[];
  choicesByLevel: Record<number, LevelChoice>;
  chosenRacialSkills: Skill[];
  startingEquipmentSelections: Record<number, number>;
  spellsKnown: string[];
  spellsPrepared: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isCantrip(spellId: string): boolean {
  return (getSpellByID(spellId)?.level ?? 1) === 0;
}

/** Builds equipment bundle requirements from the chosen class. */
function buildEquipmentRequirements(
  state: CreationRequirementState,
): EquipmentBundleRequirement[] {
  if (!state.classId) return [];

  const classData = getClassById(state.classId);
  if (!classData) return [];

  return classData.startingEquipment.choices.map((group, i) => {
    const selected = state.startingEquipmentSelections[i];
    const isResolved = selected !== undefined;

    return {
      id: `equipment_bundle_${i}`,
      type: "equipment_bundle",
      wizardStage: "equipment",
      label: `Starting equipment choice ${i + 1}`,
      isBlocking: true,
      isResolved,
      groupIndex: i,
      chooseCount: group.choose,
      options: group.options.map((opt) => ({
        itemIds: opt.equipmentBundle.map((item) => item.itemId),
      })),
    };
  });
}

/** Builds cantrip and spell requirements from spellcasting pools. */
function buildSpellRequirements(
  state: CreationRequirementState,
  pools: CreationSpellcastingPools,
): Array<CantripKnownRequirement | SpellKnownRequirement> {
  if (!pools.isSpellcaster) return [];

  const requirements: Array<CantripKnownRequirement | SpellKnownRequirement> = [];

  // Cantrips — stored in spellsKnown
  if (pools.cantripMax > 0) {
    const currentCantrips = state.spellsKnown.filter(isCantrip).length;
    requirements.push({
      id: "cantrip_known",
      type: "cantrip_known",
      wizardStage: "spells",
      label: `Choose ${pools.cantripMax} cantrip${pools.cantripMax !== 1 ? "s" : ""}`,
      isBlocking: true,
      isResolved: currentCantrips >= pools.cantripMax,
      required: pools.cantripMax,
      current: currentCantrips,
      classIds: state.classId ? [state.classId] : [],
    });
  }

  // Spells for "known" and "pact" casters (max tracked via knownMax, selections in spellsKnown)
  if (
    (pools.preparationType === "known" || pools.preparationType === "pact") &&
    pools.knownMax > 0
  ) {
    const currentKnown = state.spellsKnown.filter((id) => !isCantrip(id)).length;
    requirements.push({
      id: "spell_known",
      type: "spell_known",
      wizardStage: "spells",
      label: `Choose ${pools.knownMax} spell${pools.knownMax !== 1 ? "s" : ""}`,
      isBlocking: true,
      isResolved: currentKnown >= pools.knownMax,
      preparationType: pools.preparationType,
      required: pools.knownMax,
      current: currentKnown,
      classIds: state.classId ? [state.classId] : [],
    });
  }

  // Prepared casters: spell selection is optional at creation (they can always
  // change prepared spells after a long rest), so this is non-blocking.
  // We still surface it so the UI can offer the picker.
  if (pools.preparationType === "prepared" && pools.preparedMax > 0) {
    const currentPrepared = state.spellsPrepared.filter(
      (id) => !isCantrip(id),
    ).length;
    requirements.push({
      id: "spell_prepared",
      type: "spell_known",
      wizardStage: "spells",
      label: `Prepare up to ${pools.preparedMax} spell${pools.preparedMax !== 1 ? "s" : ""}`,
      isBlocking: false, // Prepared casters may leave this for later
      isResolved: currentPrepared > 0 || pools.preparedMax === 0,
      preparationType: "prepared",
      required: pools.preparedMax,
      current: currentPrepared,
      classIds: state.classId ? [state.classId] : [],
    });
  }

  return requirements;
}

/** Builds skill proficiency requirements from racial traits at level 1. */
function buildRacialSkillRequirements(
  state: CreationRequirementState,
): SkillProficiencyRequirement[] {
  if (!state.raceId) return [];

  // Re-use the existing choice-resolution logic, restricting to racial sources
  // only by passing null classId/subclassId.
  const pendingChoices = getPendingProficiencyChoices(
    1,
    state.raceId,
    state.subraceId,
    null,
    null,
    {},
    [],
  ).filter((c) => c.category === "skills");

  if (pendingChoices.length === 0) return [];

  // Aggregate all racial skill picks into a single requirement so the UI shows
  // one unified picker per race/subrace source.
  const raceData = getRaceById(state.raceId);
  const subraceData = getSubraceById(state.subraceId);

  const requirements: SkillProficiencyRequirement[] = pendingChoices.map(
    (choice, i) => {
      // Determine the human-readable source name
      const sourceName =
        choice.sourceName ||
        subraceData?.name ||
        raceData?.name ||
        "Racial trait";

      return {
        id: `racial_skill_${i}`,
        type: "skill_proficiency",
        wizardStage: "race",
        label: `${sourceName}: choose ${choice.count} skill${choice.count !== 1 ? "s" : ""}`,
        isBlocking: true,
        isResolved: state.chosenRacialSkills.length >= choice.count,
        sourceId: choice.sourceId,
        sourceName,
        required: choice.count,
        pool: choice.pool,
        current: state.chosenRacialSkills as string[],
      };
    },
  );

  return requirements;
}

/** Builds skill proficiency requirements from class traits at level 1. */
function buildClassSkillRequirements(
  state: CreationRequirementState,
): SkillProficiencyRequirement[] {
  if (!state.classId) return [];

  // Restrict to class sources only by passing null raceId/subraceId.
  const pendingChoices = getPendingProficiencyChoices(
    1,
    null,
    null,
    state.classId,
    null,
    {},
    state.classTracks,
  ).filter((c) => c.category === "skills");

  if (pendingChoices.length === 0) return [];

  const classData = getClassById(state.classId);
  const classSkillsChosen = state.choicesByLevel[1]?.skillChoices ?? [];

  let cumulativeRequired = 0;

  return pendingChoices.map((choice, i) => {
    const sourceName =
      choice.sourceName || classData?.name || "Class trait";

    const required = choice.count;
    // Each subsequent source picks from the same running total of chosen skills.
    const rangeStart = cumulativeRequired;
    cumulativeRequired += required;
    const current = classSkillsChosen.slice(rangeStart, cumulativeRequired);

    return {
      id: `class_skill_${i}`,
      type: "skill_proficiency",
      wizardStage: "class",
      label: `${sourceName}: choose ${required} skill${required !== 1 ? "s" : ""}`,
      isBlocking: true,
      isResolved: current.length >= required,
      sourceId: choice.sourceId,
      sourceName,
      required,
      pool: choice.pool,
      current,
    };
  });
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Derives all creation-stage requirements from the current character state and
 * the spellcasting pools computed by `useSpellcasting()`.
 *
 * Returns an empty array until a class is selected. Individual requirements
 * appear as soon as the relevant state becomes available (e.g., race selected
 * → racial skill requirements appear).
 */
export function resolveCreationRequirements(
  state: CreationRequirementState,
  pools: CreationSpellcastingPools,
): CreationRequirement[] {
  const requirements: CreationRequirement[] = [
    ...buildRacialSkillRequirements(state),
    ...buildClassSkillRequirements(state),
    ...buildSpellRequirements(state, pools),
    ...buildEquipmentRequirements(state),
  ];

  return requirements;
}
