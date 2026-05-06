import { useState } from "react";
import { getClassById } from "../data/staticDataApi";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import type { HitDie } from "../types/common";
import { DiceRoller } from "./DiceRoller/DiceRoller";

interface ShortRestModalProps {
  onClose: () => void;
}

export const ShortRestModal: React.FC<ShortRestModalProps> = ({ onClose }) => {
  const { level, classId, expendedHitDice, expendHitDie, heal, takeShortRest } =
    useCharacterStore();

  // Pull Con mod and current HP state
  const { abilities, combat } = useCharacterStats();
  const conMod = abilities.modifiers.con;

  const classData = classId ? getClassById(classId) : null;
  const hitDie: HitDie = classData?.hitDie ?? 6; // Fallback to d6 if no class

  const [manualRoll, setManualRoll] = useState<number | "">("");

  // Math variables
  const availableDice = Math.max(0, level - expendedHitDice);
  const isFullyHealed = combat.hp.current >= combat.hp.max;

  // region Actions

  const handleAutoRollComplete = (rolls: number[]) => {
    if (availableDice <= 0 || isFullyHealed) return;
    const rolledValue = rolls[0] ?? 0;

    // Negative heals cannot happen (e.g., rolling a 1 with a -2 con mod).
    const totalHeal = Math.max(0, rolledValue + conMod);

    heal(totalHeal);
    expendHitDie();
  };

  const handleManualRoll = () => {
    if (availableDice <= 0 || isFullyHealed || !manualRoll) return;

    const totalHeal = Math.max(0, Number(manualRoll) + conMod);

    heal(totalHeal);
    expendHitDie();
    setManualRoll("");
  };

  const handleFinishRest = () => {
    takeShortRest(); // Warlocks should get pack slots back
    onClose();
  };

  return (
    <div className="modal short-rest-modal">
      <h2>Take a Short Rest</h2>
      <p>Spend Hit Dice to regain health.</p>

      <div className="rest-stats">
        <span>
          <strong>HP:</strong> {combat.hp.current} / {combat.hp.max}
        </span>
        <span>
          <strong>Available Hit Dice</strong> {availableDice}d{hitDie}
        </span>
        <span>
          <strong>Con Modifier:</strong> {conMod >= 0 ? `+${conMod}` : conMod}
        </span>
      </div>

      {/* Hit Dice Controls */}
      <div className="hit-dice-controls">
        {availableDice === 0 ? (
          <p className="warning">You have no Hit Dice remaining.</p>
        ) : isFullyHealed ? (
          <p className="success">You are at maximum Hit Points.</p>
        ) : (
          <div className="roll-options">
            {/* Opt 1: Auto Roll */}
            <div className="roll-box auto-roll">
              <h4>Digital Roll</h4>
              <DiceRoller
                sides={hitDie}
                count={1}
                size="small"
                hideTotal
                rollLabel={`Roll 1d${hitDie} + Con`}
                onRollComplete={handleAutoRollComplete}
                disabled={availableDice <= 0 || isFullyHealed}
              />
            </div>

            {/* Opt 2: Manual Input */}
            <div className="roll-box manual-roll">
              <h4>Physical Roll</h4>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max={hitDie}
                  placeholder={`Roll a d${hitDie}...`}
                  value={manualRoll}
                  onChange={(e) => setManualRoll(Number(e.target.value) || "")}
                />
                <button onClick={handleManualRoll} disabled={!manualRoll}>
                  Apply
                </button>
              </div>
              <small className="help-text">
                Con modifier will be added automatically.
              </small>
            </div>
          </div>
        )}
      </div>

      <button className="finalize-btn" onClick={handleFinishRest}>
        Finish Resting
      </button>
    </div>
  );
};
