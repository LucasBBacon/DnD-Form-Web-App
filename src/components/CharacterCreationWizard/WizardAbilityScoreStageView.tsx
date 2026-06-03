import type React from "react";
import type { Ability } from "../../types/common";
import { ABILITIES, ABILITY_SHORT_LABELS } from "../../utils/abilityConstants";
import type {
  AbilityAssignmentMethod,
  PointBuyValidationResult,
  RollingInputMode,
  VirtualAbilityRoll,
} from "../../utils/abilityAssignmentUtils";
import { DiceRoller } from "../ui/DiceRoller/DiceRoller";
import "./WizardPickerStage.css";

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

export interface AbilityScoreOptionPool {
  score: number;
  available: number;
  used: number;
}

export interface WizardAbilityScoreStageViewProps {
  method: AbilityAssignmentMethod;
  rollingMode: RollingInputMode;
  pointBuyOverride: boolean;
  baseScores: Record<Ability, number>;
  completed: boolean;
  virtualRolls: VirtualAbilityRoll[];
  virtualAssignments: Partial<Record<Ability, number>>;
  virtualScorePools: AbilityScoreOptionPool[];
  pointBuy: PointBuyValidationResult;
  isVirtualValid: boolean;
  isPhysicalValid: boolean;
  isStandardArrayValid: boolean;
  isPointBuyComplete: boolean;
  canContinue: boolean;
  error: string | null;
  onMethodChange: (method: AbilityAssignmentMethod) => void;
  onRollModeChange: (mode: RollingInputMode) => void;
  onStandardArrayChange: (ability: Ability, value: number) => void;
  onPointBuyInput: (ability: Ability, value: number) => void;
  onPointBuyOverrideChange: (accepted: boolean) => void;
  onVirtualRollComplete: (rolls: number[]) => void;
  onRerollAll: () => void;
  onVirtualAssignmentChange: (ability: Ability, score: number | null) => void;
  onConfirm: () => void;
  onContinue: () => void;
}

export const WizardAbilityScoreStageView: React.FC<
  WizardAbilityScoreStageViewProps
> = ({
  method,
  rollingMode,
  pointBuyOverride,
  baseScores,
  completed,
  virtualRolls,
  virtualAssignments,
  virtualScorePools,
  pointBuy,
  isVirtualValid,
  isPhysicalValid,
  isStandardArrayValid,
  isPointBuyComplete: _isPointBuyComplete,
  canContinue,
  error,
  onMethodChange,
  onRollModeChange,
  onStandardArrayChange,
  onPointBuyInput,
  onPointBuyOverrideChange,
  onVirtualRollComplete,
  onRerollAll,
  onVirtualAssignmentChange,
  onConfirm,
  onContinue,
}) => {
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
            onClick={() => onMethodChange(option)}
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
                  onChange={(event) =>
                    onStandardArrayChange(ability, Number(event.target.value))
                  }
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
            {isStandardArrayValid
              ? "Valid standard array assignment"
              : "Current assignment is not a valid standard array"}
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
                    onPointBuyInput(ability, Number(event.target.value))
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
                onChange={(event) => onPointBuyOverrideChange(event.target.checked)}
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
              onClick={() => onRollModeChange("virtual")}
            >
              Virtual rolls
            </button>
            <button
              type="button"
              className={`ability-method-btn ${rollingMode === "physical" ? "selected" : ""}`}
              onClick={() => onRollModeChange("physical")}
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
                    onRollComplete={onVirtualRollComplete}
                    disabled={virtualRolls.length >= 6}
                  />
                </div>
              </div>

              <div className="ability-roll-controls">
                <button
                  type="button"
                  className="wizard-continue-btn"
                  onClick={onRerollAll}
                >
                  Reroll All Six
                </button>
              </div>

              <div className="picker-counter">{virtualRolls.length} / 6 rolls generated</div>

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
                          onVirtualAssignmentChange(
                            ability,
                            raw === "" ? null : Number(raw),
                          );
                        }}
                      >
                        <option value="">Select roll</option>
                        {virtualScorePools.flatMap(({ score, available, used }) =>
                          Array.from({ length: available }, (_, index) => {
                            const isCurrent = current === score;
                            const isDisabled = !isCurrent && used >= available;
                            return (
                              <option
                                key={`${ability}-${score}-${index}`}
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
                      min={3}
                      max={18}
                      onChange={(event) =>
                        onPointBuyInput(ability, Number(event.target.value))
                      }
                    />
                  </label>
                ))}
              </div>
              <div className={`picker-counter ${isPhysicalValid ? "complete" : ""}`}>
                {isPhysicalValid
                  ? "All roll values are valid"
                  : "Each value must be 3 through 18"}
              </div>
            </>
          )}
        </>
      )}

      {error && <p className="ability-error">{error}</p>}

      <div className="ability-actions-row">
        <button type="button" className="wizard-continue-btn" onClick={onConfirm}>
          Confirm Ability Scores
        </button>
        <button
          type="button"
          className="wizard-continue-btn"
          disabled={!canContinue || !completed}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
