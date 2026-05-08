import { useState } from "react";
import { getClassById } from "../data/staticDataApi";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import type { HitDie } from "../types/common";
import { DiceRoller } from "./DiceRoller/DiceRoller";
import type { RestType } from "../store/useCharacterStore";
import "./ShortRestModal.css";

interface ShortRestModalProps {
  restType?: RestType;
  onClose: () => void;
}

export const ShortRestModal: React.FC<ShortRestModalProps> = ({
  restType = "short",
  onClose,
}) => {
  const {
    level,
    classId,
    expendedHitDice,
    expendHitDie,
    heal,
    takeShortRest,
    takeLongRest,
  } = useCharacterStore();

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
    takeShortRest(); // Warlocks should get pact slots back
    onClose();
  };

  const handleConfirmLongRest = () => {
    takeLongRest();
    onClose();
  };

  const recoveredHitDice = Math.max(1, Math.floor(level / 2));
  const isShortRest = restType === "short";

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal short-rest-modal" role="dialog" aria-modal="true">
        <header className="rest-modal-header">
          <h2>{isShortRest ? "Take a Short Rest" : "Take a Long Rest"}</h2>
          <button
            type="button"
            className="rest-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {isShortRest ? (
          <>
            <p className="rest-copy">Spend Hit Dice to regain health.</p>

            <div className="rest-stats">
              <span>
                <strong>HP:</strong> {combat.hp.current} / {combat.hp.max}
              </span>
              <span>
                <strong>Available Hit Dice:</strong> {availableDice}d{hitDie}
              </span>
              <span>
                <strong>Con Modifier:</strong> {conMod >= 0 ? `+${conMod}` : conMod}
              </span>
            </div>

            <div className="hit-dice-controls">
              {availableDice === 0 ? (
                <p className="warning">You have no Hit Dice remaining.</p>
              ) : isFullyHealed ? (
                <p className="success">You are at maximum Hit Points.</p>
              ) : (
                <div className="roll-options">
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
                      <button type="button" onClick={handleManualRoll} disabled={!manualRoll}>
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

            <button type="button" className="finalize-btn" onClick={handleFinishRest}>
              Finish Short Rest
            </button>
          </>
        ) : (
          <>
            <p className="rest-copy">
              Long rest restores all hit points, resets spell slots, clears temporary hit
              points, and recovers up to half your total Hit Dice.
            </p>
            <ul className="rest-summary">
              <li>HP after rest: {combat.hp.max}</li>
              <li>Temp HP after rest: 0</li>
              <li>Hit Dice recovered: up to {recoveredHitDice}</li>
              <li>Pact slots and standard slots: fully restored</li>
            </ul>

            <div className="rest-reminder" role="note">
              2014 5e reminder: A character can only benefit from one long rest per 24
              hours and must begin the rest with at least 1 HP.
            </div>

            <div className="long-rest-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="finalize-btn"
                onClick={handleConfirmLongRest}
              >
                Confirm Long Rest
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
