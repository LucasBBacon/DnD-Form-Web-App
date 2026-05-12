import type React from "react";
import { useMemo, useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { ABILITIES } from "../../utils/abilityConstants";
import {
  isStandardArrayAssignment,
  toVirtualAbilityRoll,
  type AbilityAssignmentMethod,
  type RollingInputMode,
  validatePointBuyAssignment,
} from "../../utils/abilityAssignmentUtils";
import type { Ability } from "../../types/common";
import "./WizardPickerStage.css";
import { WizardAbilityScoreStageView } from "./WizardAbilityScoreStageView";

const PHYSICAL_ROLL_MIN = 3;
const PHYSICAL_ROLL_MAX = 18;

const clampInteger = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, Math.floor(value)));

const isD6RollTuple = (
  rolls: number[],
): rolls is [number, number, number, number] => (
  rolls.length === 4
  && rolls.every((value) => Number.isInteger(value) && value >= 1 && value <= 6)
);

interface WizardAbilityScoreStageProps {
  onContinue: () => void;
}

export const WizardAbilityScoreStage: React.FC<WizardAbilityScoreStageProps> = ({
  onContinue,
}) => {
  const [error, setError] = useState<string | null>(null);

  const method = useCharacterStore((s) => s.abilityAssignmentMethod);
  const rollingMode = useCharacterStore((s) => s.abilityRollingInputMode);
  const pointBuyOverride = useCharacterStore((s) => s.abilityPointBuyOverrideAccepted);
  const baseScores = useCharacterStore((s) => s.baseAbilityScores);
  const completed = useCharacterStore((s) => s.abilityAssignmentCompleted);
  const virtualRolls = useCharacterStore((s) => s.abilityVirtualRolls);
  const virtualAssignments = useCharacterStore((s) => s.abilityVirtualRollAssignments);

  const setMethod = useCharacterStore((s) => s.setAbilityAssignmentMethod);
  const setRollingMode = useCharacterStore((s) => s.setAbilityRollingInputMode);
  const setOverride = useCharacterStore((s) => s.setAbilityPointBuyOverrideAccepted);
  const setCompleted = useCharacterStore((s) => s.setAbilityAssignmentCompleted);
  const setBaseScores = useCharacterStore((s) => s.setBaseAbilityScores);
  const setBaseScore = useCharacterStore((s) => s.setBaseAbilityScore);
  const setVirtualRolls = useCharacterStore((s) => s.setAbilityVirtualRolls);
  const setVirtualAssignment = useCharacterStore((s) => s.setAbilityVirtualRollAssignment);
  const clearVirtualAssignments = useCharacterStore((s) => s.clearAbilityVirtualRollAssignments);

  const pointBuy = useMemo(() => validatePointBuyAssignment(baseScores), [baseScores]);

  const virtualAvailableCounts = useMemo(() => {
    const counts = new Map<number, number>();
    virtualRolls.forEach((roll) => {
      counts.set(roll.total, (counts.get(roll.total) ?? 0) + 1);
    });
    return counts;
  }, [virtualRolls]);

  const virtualUsedCounts = useMemo(() => {
    const counts = new Map<number, number>();
    Object.values(virtualAssignments).forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return counts;
  }, [virtualAssignments]);

  const isVirtualValid = useMemo(() => {
    if (virtualRolls.length !== 6) return false;
    if (Object.values(virtualAssignments).length !== 6) return false;

    return Array.from(virtualUsedCounts.entries()).every(
      ([score, used]) => used <= (virtualAvailableCounts.get(score) ?? 0),
    );
  }, [virtualAssignments, virtualAvailableCounts, virtualRolls.length, virtualUsedCounts]);

  const isPhysicalValid = useMemo(
    () =>
      ABILITIES.every((ability) => {
        const score = baseScores[ability];
        return score >= PHYSICAL_ROLL_MIN && score <= PHYSICAL_ROLL_MAX;
      }),
    [baseScores],
  );

  const isStandardArrayValid = useMemo(
    () => isStandardArrayAssignment(baseScores),
    [baseScores],
  );

  const isPointBuyComplete = pointBuy.isStrictlyValid || pointBuyOverride;

  const handleMethodChange = (nextMethod: AbilityAssignmentMethod) => {
    setMethod(nextMethod);
    setCompleted(false);
    setError(null);
  };

  const handleRollModeChange = (nextMode: RollingInputMode) => {
    setRollingMode(nextMode);
    setCompleted(false);
    setError(null);
  };

  const handleStandardArrayChange = (ability: Ability, value: number) => {
    const next = { ...baseScores, [ability]: value };
    setBaseScores(next);
    setCompleted(false);
    setError(null);
  };

  const handlePointBuyInput = (ability: Ability, value: number) => {
    setBaseScore(ability, value);
    setCompleted(false);
    setError(null);
  };

  const handleVirtualRollComplete = (rolls: number[]) => {
    if (virtualRolls.length >= 6) return;
    if (!isD6RollTuple(rolls)) return;

    setVirtualRolls([...virtualRolls, toVirtualAbilityRoll(rolls)]);
    setCompleted(false);
    setError(null);
  };

  const handleRerollAll = () => {
    setVirtualRolls([]);
    clearVirtualAssignments();
    setCompleted(false);
    setError(null);
  };

  const applyVirtualAssignmentsToBaseScores = () => {
    const nextScores = { ...baseScores };
    ABILITIES.forEach((ability) => {
      const assigned = virtualAssignments[ability];
      if (typeof assigned === "number") {
        nextScores[ability] = assigned;
      }
    });
    setBaseScores(nextScores);
  };

  const handleConfirm = () => {
    if (method === "standard_array") {
      if (!isStandardArrayValid) {
        setError("Assign the full standard array values exactly once before continuing.");
        return;
      }
      setCompleted(true);
      setError(null);
      return;
    }

    if (method === "point_buy") {
      if (!isPointBuyComplete) {
        setError("Point buy is invalid. Fix values or enable override to continue.");
        return;
      }
      setCompleted(true);
      setError(null);
      return;
    }

    if (rollingMode === "virtual") {
      if (!isVirtualValid) {
        setError("Generate six rolls and assign each to exactly one ability.");
        return;
      }
      applyVirtualAssignmentsToBaseScores();
      setCompleted(true);
      setError(null);
      return;
    }

    if (!isPhysicalValid) {
      setError("Physical roll entries must be between 3 and 18 for every ability.");
      return;
    }

    setCompleted(true);
    setError(null);
  };

  const canContinue = completed && (
    (method === "standard_array" && isStandardArrayValid)
    || (method === "point_buy" && isPointBuyComplete)
    || (method === "rolling" && (rollingMode === "virtual" ? isVirtualValid : isPhysicalValid))
  );

  const virtualScorePools = Array.from(virtualAvailableCounts.entries()).map(
    ([score, available]) => ({
      score,
      available,
      used: virtualUsedCounts.get(score) ?? 0,
    }),
  );

  return (
    <WizardAbilityScoreStageView
      method={method}
      rollingMode={rollingMode}
      pointBuyOverride={pointBuyOverride}
      baseScores={baseScores}
      completed={completed}
      virtualRolls={virtualRolls}
      virtualAssignments={virtualAssignments}
      virtualScorePools={virtualScorePools}
      pointBuy={pointBuy}
      isVirtualValid={isVirtualValid}
      isPhysicalValid={isPhysicalValid}
      isStandardArrayValid={isStandardArrayValid}
      isPointBuyComplete={isPointBuyComplete}
      canContinue={canContinue}
      error={error}
      onMethodChange={handleMethodChange}
      onRollModeChange={handleRollModeChange}
      onStandardArrayChange={handleStandardArrayChange}
      onPointBuyInput={(ability, value) =>
        handlePointBuyInput(ability, clampInteger(value, 3, 18))
      }
      onPointBuyOverrideChange={setOverride}
      onVirtualRollComplete={handleVirtualRollComplete}
      onRerollAll={handleRerollAll}
      onVirtualAssignmentChange={setVirtualAssignment}
      onConfirm={handleConfirm}
      onContinue={onContinue}
    />
  );
};
