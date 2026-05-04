import { useMemo } from "react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useSpellcasting } from "./useSpellcasting";
import {
  resolveCreationRequirements,
  type CreationSpellcastingPools,
} from "../utils/creationRequirementUtils";
import type { CreationRequirement, WizardStageId } from "../types/creationRequirement";

export interface UseCreationRequirementsReturn {
  /** All resolved requirement objects for the current character state. */
  all: CreationRequirement[];
  /** Subset of requirements that are blocking (isBlocking) and unresolved. */
  blocking: CreationRequirement[];
  /**
   * Returns true when no blocking requirements exist for the given stage,
   * meaning the user may advance past it.
   */
  isStageComplete: (stageId: WizardStageId) => boolean;
}

/**
 * Derives all character-creation requirements for the current character and
 * whether each stage is complete (no unresolved blocking requirements).
 *
 * Intended for use inside the CharacterCreationWizard to drive step-blocker
 * logic and the right-rail progress display.
 */
export function useCreationRequirements(): UseCreationRequirementsReturn {
  const classId = useCharacterStore((s) => s.classId);
  const raceId = useCharacterStore((s) => s.raceId);
  const subraceId = useCharacterStore((s) => s.subraceId);
  const level = useCharacterStore((s) => s.level);
  const classTracks = useCharacterStore((s) => s.classTracks);
  const choicesByLevel = useCharacterStore((s) => s.choicesByLevel);
  const chosenRacialSkills = useCharacterStore((s) => s.chosenRacialSkills);
  const startingEquipmentSelections = useCharacterStore(
    (s) => s.startingEquipmentSelections,
  );
  const spellsKnown = useCharacterStore((s) => s.spellsKnown);
  const spellsPrepared = useCharacterStore((s) => s.spellsPrepared);
  const baseAbilityScores = useCharacterStore((s) => s.baseAbilityScores);
  const abilityAssignmentMethod = useCharacterStore((s) => s.abilityAssignmentMethod);
  const abilityRollingInputMode = useCharacterStore((s) => s.abilityRollingInputMode);
  const abilityPointBuyOverrideAccepted = useCharacterStore(
    (s) => s.abilityPointBuyOverrideAccepted,
  );
  const abilityAssignmentCompleted = useCharacterStore(
    (s) => s.abilityAssignmentCompleted,
  );
  const abilityVirtualRolls = useCharacterStore((s) => s.abilityVirtualRolls);
  const abilityVirtualRollAssignments = useCharacterStore(
    (s) => s.abilityVirtualRollAssignments,
  );

  const { isSpellcaster, pools, casting } = useSpellcasting();

  const spellPools = useMemo<CreationSpellcastingPools>(
    () => ({
      isSpellcaster,
      cantripMax: pools.cantrips.max,
      knownMax: pools.known.max,
      preparedMax: pools.prepared.max,
      preparationType: casting.preparationType,
    }),
    [
      isSpellcaster,
      pools.cantrips.max,
      pools.known.max,
      pools.prepared.max,
      casting.preparationType,
    ],
  );

  const all = useMemo(
    () =>
      resolveCreationRequirements(
        {
          classId,
          raceId,
          subraceId,
          level,
          classTracks,
          choicesByLevel,
          chosenRacialSkills,
          startingEquipmentSelections,
          spellsKnown,
          spellsPrepared,
          baseAbilityScores,
          abilityAssignmentMethod,
          abilityRollingInputMode,
          abilityPointBuyOverrideAccepted,
          abilityAssignmentCompleted,
          abilityVirtualRollTotals: abilityVirtualRolls.map((roll) => roll.total),
          abilityVirtualRollAssignments,
        },
        spellPools,
      ),
    [
      classId,
      raceId,
      subraceId,
      level,
      classTracks,
      choicesByLevel,
      chosenRacialSkills,
      startingEquipmentSelections,
      spellsKnown,
      spellsPrepared,
      baseAbilityScores,
      abilityAssignmentMethod,
      abilityRollingInputMode,
      abilityPointBuyOverrideAccepted,
      abilityAssignmentCompleted,
      abilityVirtualRolls,
      abilityVirtualRollAssignments,
      spellPools,
    ],
  );

  const blocking = useMemo(
    () => all.filter((r) => r.isBlocking && !r.isResolved),
    [all],
  );

  const isStageComplete = useMemo(
    () => (stageId: WizardStageId) =>
      !blocking.some((r) => r.wizardStage === stageId),
    [blocking],
  );

  return { all, blocking, isStageComplete };
}
