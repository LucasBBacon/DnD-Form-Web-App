import { useState } from "react";
import { getRaceById, getSubraceById } from "../../data/staticDataApi";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { Ability } from "../../types/common";
import { roll4d6DropLowest } from "../../utils/dice";
import {
  calculateModifier,
  calculateTotalAbilityScore,
} from "../../utils/abilityUtils";

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

export const AbilityScoreStep = ({ onFinish }: { onFinish: () => void }) => {
  const {
    setBaseAbilityScores,
    setChosenRacialBonuses,
    raceId,
    subraceId,
  } = useCharacterStore();

  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;

  // local state for raw numbers rolled/inputted (default 10)
  const [rawScores, setRawScores] = useState<Record<Ability, number>>({
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  });

  // aggregate all choice blocks from both race, subrace, give unique IDs
  const availableChoices = [
    ...(raceData?.abilityBonuses?.choices || []).map((c, i) => ({
      ...c,
      id: `race_choice_${i}`,
    })),
    ...(subraceData?.abilityBonuses?.choices || []).map((c, i) => ({
      ...c,
      id: `subrace_choice_${i}`,
    })),
  ];

  // State maps choice block ID to an array of selected abilities
  const [floatingSelections, setFloatingSelections] = useState<
    Record<string, Ability[]>
  >({});

  // Compile local selections into the correct format for math util
  const localChosenBonuses: Partial<Record<Ability, number>> = {};
  availableChoices.forEach((choice) => {
    const selectedStats = floatingSelections[choice.id] || [];
    selectedStats.forEach((stat) => {
      localChosenBonuses[stat] = (localChosenBonuses[stat] || 0) + choice.bonus;
    });
  });

  // region Handlers

  const handleUpdateScore = (stat: Ability, val: number) => {
    // Keep it within standard 5e bounds
    const boundedVal = Math.max(1, Math.min(20, val));
    setRawScores((prev) => ({ ...prev, [stat]: boundedVal }));
  };

  const handleRollSingle = (stat: Ability) => {
    setRawScores((prev) => ({ ...prev, [stat]: roll4d6DropLowest() }));
  };

  const handleRollAll = () => {
    setRawScores({
      str: roll4d6DropLowest(),
      dex: roll4d6DropLowest(),
      con: roll4d6DropLowest(),
      int: roll4d6DropLowest(),
      wis: roll4d6DropLowest(),
      cha: roll4d6DropLowest(),
    });
  };

  const toggleFloatingChoice = (
    choiceId: string,
    stat: Ability,
    maxCount: number,
  ) => {
    setFloatingSelections((prev) => {
      const current = prev[choiceId] || [];
      if (current.includes(stat)) {
        // remove it
        return { ...prev, [choiceId]: current.filter((s) => s !== stat) };
      } else if (current.length < maxCount) {
        // add it
        return { ...prev, [choiceId]: [...current, stat] };
      }
      return prev;
    });
  };

  // Validation
  // Ensure every choice block has the required number of selections
  const isFloatingChoicesValid = availableChoices.every((choice) => {
    const selectedCount = (floatingSelections[choice.id] || []).length;
    return selectedCount === choice.count;
  });

  const handleLockIn = () => {
    // push raw scores to global zustand
    setBaseAbilityScores(rawScores);
    setChosenRacialBonuses(localChosenBonuses);
    onFinish();
  };

  return (
    <div className="wizard-step abilities-step">
      <h2>Determine Ability Scores</h2>
      <p>
        Type in your Physical dice rolls, use Standard Array (15, 14, 13, 12,
        10, 8), or let the app rolls 4d6 (drop lowest) for you.
      </p>

      <div className="roll-all-container">
        <button className="roll-all-btn" onClick={handleRollAll}>
          Auto-Roll All Stats
        </button>
      </div>

      {/* Floating choices */}
      {availableChoices.length > 0 && (
        <div className="floating-choices-block choice-block">
          <h3>Racial Ability Choices</h3>
          {availableChoices.map((choice) => {
            const selected = floatingSelections[choice.id] || [];
            const isFull = selected.length >= choice.count;

            return (
              <div key={choice.id} className="floating-choice-row">
                <p>
                  Choose <strong>{choice.count - selected.length}</strong>{" "}
                  ability score(s) to increase by +{choice.bonus}:
                </p>
                <div className="skill-grid">
                  {choice.pool.map((stat) => {
                    const isChecked = selected.includes(stat);
                    const isDisabled = !isChecked && isFull;

                    return (
                      <label
                        key={stat}
                        className={`skill-checkbox ${isDisabled ? "disabled" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() =>
                            toggleFloatingChoice(choice.id, stat, choice.count)
                          }
                        />
                        {stat.toUpperCase()}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live preview grid */}
      <div className="abilities-input-grid">
        <div className="grid-header">
          <span>Stat</span>
          <span>Raw Score</span>
          <span></span> {/* Roll Button Col */}
          <span>Race Bonus</span>
          <span>Final Score</span>
        </div>

        {ABILITIES.map((stat) => {
          // Live preview math
          // calculate what the actual final score will be based on earlier race choice
          const totalScore = calculateTotalAbilityScore(
            stat,
            rawScores[stat],
            raceData,
            subraceData,
            localChosenBonuses,
            0,
          );
          const mod = calculateModifier(totalScore);
          const racialBonus = totalScore - rawScores[stat];

          return (
            <div key={stat} className="ability-input-row">
              <span className="stat-label">{stat.toUpperCase()}</span>

              {/* Manual Input */}
              <input
                type="number"
                value={rawScores[stat] || ""}
                onChange={(e) =>
                  handleUpdateScore(stat, parseInt(e.target.value) || 0)
                }
              />
              {/* Auto Roll */}
              <button
                className="roll-btn"
                onClick={() => handleRollSingle(stat)}
              >
                Roll
              </button>

              {/* Racial Bonus Preview */}
              <span
                className={`racial-bonus ${racialBonus > 0 ? "positive" : "neutral"}`}
              >
                {racialBonus > 0 ? `+${racialBonus}` : "-"}
              </span>

              {/* Final Preview */}
              <div className="final-preview">
                <strong>{totalScore}</strong>
                <span className="mod-preview">
                  ({mod >= 0 ? `+${mod}` : mod})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="lock-in-btn finalize"
        onClick={handleLockIn}
        disabled={!isFloatingChoicesValid}
      >
        Continue
      </button>
    </div>
  );
};
