import type React from "react";
import type { HitDie } from "../../types/common";
import type { RestType } from "../../store/useCharacterStore";
import "./ShortRestModal.css";
import { HitDiceRollPanel } from "./ui/HitDiceRollPanel";

export interface ShortRestModalViewProps {
  restType?: RestType;
  onClose: () => void;
  hpCurrent: number;
  hpMax: number;
  availableDice: number;
  hitDie: HitDie;
  conMod: number;
  recoveredHitDice: number;
  onApplyHitDie: (totalHeal: number) => void;
  onFinishShortRest: () => void;
  onConfirmLongRest: () => void;
}

export const ShortRestModalView: React.FC<ShortRestModalViewProps> = ({
  restType = "short",
  onClose,
  hpCurrent,
  hpMax,
  availableDice,
  hitDie,
  conMod,
  recoveredHitDice,
  onApplyHitDie,
  onFinishShortRest,
  onConfirmLongRest,
}) => {
  const isFullyHealed = hpCurrent >= hpMax;
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
            X
          </button>
        </header>

        {isShortRest ? (
          <>
            <p className="rest-copy">Spend Hit Dice to regain health.</p>

            <div className="rest-stats">
              <span>
                <strong>HP:</strong> {hpCurrent} / {hpMax}
              </span>
              <span>
                <strong>Available Hit Dice:</strong> {availableDice}d{hitDie}
              </span>
              <span>
                <strong>Con Modifier:</strong> {conMod >= 0 ? `+${conMod}` : conMod}
              </span>
            </div>

            <div className="hit-dice-controls">
              <HitDiceRollPanel
                availableDice={availableDice}
                hitDie={hitDie}
                conMod={conMod}
                isFullyHealed={isFullyHealed}
                onRoll={onApplyHitDie}
              />
            </div>

            <button
              type="button"
              className="finalize-btn"
              onClick={onFinishShortRest}
            >
              Finish Short Rest
            </button>
          </>
        ) : (
          <>
            <p className="rest-copy">
              Long rest restores all hit points, resets spell slots, clears
              temporary hit points, and recovers up to half your total Hit Dice.
            </p>
            <ul className="rest-summary">
              <li>HP after rest: {hpMax}</li>
              <li>Temp HP after rest: 0</li>
              <li>Hit Dice recovered: up to {recoveredHitDice}</li>
              <li>Pact slots and standard slots: fully restored</li>
            </ul>

            <div className="rest-reminder" role="note">
              2014 5e reminder: A character can only benefit from one long rest
              per 24 hours and must begin the rest with at least 1 HP.
            </div>

            <div className="long-rest-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="finalize-btn"
                onClick={onConfirmLongRest}
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
