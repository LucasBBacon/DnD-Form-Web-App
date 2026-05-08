import type React from "react";
import { useMemo, useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { ABILITIES, ABILITY_SHORT_LABELS } from "../../utils/abilityConstants";
import {
  isStandardArrayAssignment,
  toVirtualAbilityRoll,
  type AbilityAssignmentMethod,
  type RollingInputMode,
  validatePointBuyAssignment,
} from "../../utils/abilityAssignmentUtils";
import type { Ability } from "../../types/common";
import { DiceRoller } from "../DiceRoller/DiceRoller";
import "./WizardPickerStage.css";

const PHYSICAL_ROLL_MIN = 3;
const PHYSICAL_ROLL_MAX = 18;

const METHOD_LABELS: Record<AbilityAssignmentMethod, string> = {
  rolling: "Rolling (4d6 drop lowest)",
  standard_array: "Standard Array (15, 14, 13, 12, 10, 8)",
  point_buy: "Point Buy (27 points)",
};

const formatDiceBreakdown = (dice: number[], dropped: number): string => {
  const sorted = [...dice].sort((a, b) => a - b);
  const kept = sorted.slice(1).join(" + ");
  return `${dice.join(", ")} (drop ${dropped}) = ${kept}`;
};

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

  return (
    <div className="picker-stage">
      <h2 className="picker-stage-title">Ability Scores</h2>
      <p className="picker-stage-subtitle">
        Pick a method, assign your six ability scores, then confirm.
      </p>

      <div className="picker-section-header">Method</div>
      <div className="ability-method-grid">
        {(Object.keys(METHOD_LABELS) as AbilityAssignmentMethod[]).map((option) => (
          <button
            key={option}
            type="button"
            className={`ability-method-btn ${method === option ? "selected" : ""}`}
            onClick={() => handleMethodChange(option)}
          >
            {METHOD_LABELS[option]}
          </button>
        ))}
      </div>

      {method === "standard_array" && (
        <>
          <div className="picker-counter">Use each value once: 15, 14, 13, 12, 10, 8</div>
          <div className="ability-input-grid">
            {ABILITIES.map((ability) => (
              <label key={ability} className="ability-input-row">
                <span>{ABILITY_SHORT_LABELS[ability]}</span>
                <select
                  value={baseScores[ability]}
                  onChange={(event) => handleStandardArrayChange(ability, Number(event.target.value))}
                >
                  {[15, 14, 13, 12, 10, 8].map((value) => (
                    <option key={`${ability}-${value}`} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className={`picker-counter ${isStandardArrayValid ? "complete" : ""}`}>
            {isStandardArrayValid ? "Valid standard array assignment" : "Current assignment is not a valid standard array"}
          </div>
        </>
      )}

      {method === "point_buy" && (
        <>
          <div className="picker-counter">PHB point buy: 8-15, budget 27 points</div>
          <div className="ability-input-grid">
            {ABILITIES.map((ability) => (
              <label key={ability} className="ability-input-row">
                <span>{ABILITY_SHORT_LABELS[ability]}</span>
                <input
                  type="number"
                  value={baseScores[ability]}
                  min={3}
                  max={18}
                  onChange={(event) =>
                    handlePointBuyInput(ability, clampInteger(Number(event.target.value), 3, 18))
                  }
                />
              </label>
            ))}
          </div>
          <div className={`picker-counter ${pointBuy.isStrictlyValid ? "complete" : ""}`}>
            {pointBuy.totalCost} / 27 points
            {!pointBuy.isInRange && " (contains out-of-range values for strict point buy)"}
          </div>
          {!pointBuy.isStrictlyValid && (
            <label className="ability-override-row">
              <input
                type="checkbox"
                checked={pointBuyOverride}
                onChange={(event) => setOverride(event.target.checked)}
              />
              Allow house-rule override and continue anyway
            </label>
          )}
        </>
      )}

      {method === "rolling" && (
        <>
          <div className="picker-section-header">Rolling Mode</div>
          <div className="ability-mode-grid">
            <button
              type="button"
              className={`ability-method-btn ${rollingMode === "virtual" ? "selected" : ""}`}
              onClick={() => handleRollModeChange("virtual")}
            >
              Virtual rolls
            </button>
            <button
              type="button"
              className={`ability-method-btn ${rollingMode === "physical" ? "selected" : ""}`}
              onClick={() => handleRollModeChange("physical")}
            >
              Physical dice entry
            </button>
          </div>

          {rollingMode === "virtual" && (
            <>
              <div className="ability-roll-controls">
                <div className="ability-virtual-roller">
                  <DiceRoller
                    count={4}
                    sides={6}
                    size="small"
                    rollLabel={
                      virtualRolls.length >= 6
                        ? "All six scores generated"
                        : `Roll score ${virtualRolls.length + 1} of 6 (4d6 drop lowest)`
                    }
                    onRollComplete={handleVirtualRollComplete}
                    disabled={virtualRolls.length >= 6}
                  />
                </div>
              </div>

              <div className="ability-roll-controls">
                <button
                  type="button"
                  className="wizard-continue-btn"
                  onClick={handleRerollAll}
                >
                  Reroll All Six
                </button>
              </div>

              <div className="picker-counter">
                {virtualRolls.length} / 6 rolls generated
              </div>

              {virtualRolls.length > 0 && (
                <div className="ability-roll-list">
                  {virtualRolls.map((roll, index) => (
                    <div key={`roll-${index}`} className="ability-roll-card">
                      <div className="ability-roll-title">Roll {index + 1}: {roll.total}</div>
                      <div className="ability-roll-meta">
                        {formatDiceBreakdown(roll.dice, roll.dropped)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="ability-input-grid">
                {ABILITIES.map((ability) => {
                  const current = virtualAssignments[ability];
                  return (
                    <label key={ability} className="ability-input-row">
                      <span>{ABILITY_SHORT_LABELS[ability]}</span>
                      <select
                        value={typeof current === "number" ? current : ""}
                        onChange={(event) => {
                          const raw = event.target.value;
                          setVirtualAssignment(ability, raw === "" ? null : Number(raw));
                        }}
                      >
                        <option value="">Select roll</option>
                        {Array.from(virtualAvailableCounts.entries()).flatMap(([score, count]) =>
                          Array.from({ length: count }, (_, idx) => {
                            const used = virtualUsedCounts.get(score) ?? 0;
                            const isCurrent = current === score;
                            const isDisabled = !isCurrent && used >= count;
                            return (
                              <option
                                key={`${ability}-${score}-${idx}`}
                                value={score}
                                disabled={isDisabled}
                              >
                                {score}
                              </option>
                            );
                          }),
                        )}
                      </select>
                    </label>
                  );
                })}
              </div>
              <div className={`picker-counter ${isVirtualValid ? "complete" : ""}`}>
                {Object.values(virtualAssignments).length} / 6 assigned
              </div>
            </>
          )}

          {rollingMode === "physical" && (
            <>
              <div className="picker-counter">
                Enter your rolled results directly for each ability (3-18).
              </div>
              <div className="ability-input-grid">
                {ABILITIES.map((ability) => (
                  <label key={ability} className="ability-input-row">
                    <span>{ABILITY_SHORT_LABELS[ability]}</span>
                    <input
                      type="number"
                      value={baseScores[ability]}
                      min={PHYSICAL_ROLL_MIN}
                      max={PHYSICAL_ROLL_MAX}
                      onChange={(event) =>
                        setBaseScore(
                          ability,
                          clampInteger(
                            Number(event.target.value),
                            PHYSICAL_ROLL_MIN,
                            PHYSICAL_ROLL_MAX,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
              <div className={`picker-counter ${isPhysicalValid ? "complete" : ""}`}>
                {isPhysicalValid ? "All roll values are valid" : "Each value must be 3 through 18"}
              </div>
            </>
          )}
        </>
      )}

      {error && <p className="ability-error">{error}</p>}

      <div className="ability-actions-row">
        <button
          type="button"
          className="wizard-continue-btn"
          onClick={handleConfirm}
        >
          Confirm Ability Scores
        </button>
        <button
          type="button"
          className="wizard-continue-btn"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
