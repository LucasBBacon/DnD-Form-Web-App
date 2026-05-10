import type React from "react";
import type { HitDie } from "../../../types/common";
import { DiceRoller } from "../../DiceRoller/DiceRoller";
import { useState } from "react";

interface HitDiceRollPanelProps {
  availableDice: number;
  hitDie: HitDie;
  conMod: number;
  isFullyHealed: boolean;
  onRoll: (totalHeal: number) => void;
}

export const HitDiceRollPanel: React.FC<HitDiceRollPanelProps> = ({
  availableDice,
  hitDie,
  conMod,
  isFullyHealed,
  onRoll,
}) => {
  const [manualRoll, setManualRoll] = useState<number | "">("");

  const handleAutoRollComplete = (rolls: number[]) => {
    if (availableDice <= 0 || isFullyHealed) return;
    const rolledValue = rolls[0] ?? 0;
    onRoll(Math.max(0, rolledValue + conMod));
  };

  const handleManualRoll = () => {
    if (availableDice <= 0 || isFullyHealed || !manualRoll) return;
    onRoll(Math.max(0, Number(manualRoll) + conMod));
    setManualRoll("");
  };

  if (availableDice === 0) {
    return <p className="warning">You have no Hit Dice remaining.</p>;
  }

  if (isFullyHealed) {
    return <p className="success">You are at maximum Hit Points.</p>;
  }

  return (
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
          disabled={false}
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
        <small className="help-text">Con modifier will be added automatically.</small>
      </div>
    </div>
  );
};
