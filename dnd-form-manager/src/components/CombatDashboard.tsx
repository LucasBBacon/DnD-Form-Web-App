import { useState } from "react";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import { ShortRestModal } from "./ShortRestModal";

export const CombatDashboard = () => {
  const {
    takeDamage,
    heal,
    setTempHp,
    tempHp,
    deathSaves,
    recordDeathSave,
    takeLongRest,
  } = useCharacterStore();

  const { maxHp, currentHp } = useCharacterStats();

  const [inputValue, setInputValue] = useState<number | "">("");

  const [showShortRest, setShowShortRest] = useState(false);

  const handleHealthChange = (type: "damage" | "heal" | "temp") => {
    if (!inputValue) return;

    const amount = Number(inputValue);
    if (type === "damage") takeDamage(amount);
    if (type === "heal") heal(amount);
    if (type === "temp") setTempHp(amount);

    setInputValue(""); // clear input after applying
  };

  const isUnconscious = currentHp === 0;

  return (
    <div className="combat-dashboard">
      <div className="health-block">
        <div className="hp-display">
          <h2>
            HP: {currentHp} / {maxHp}
          </h2>
          {tempHp > 0 && <span className="temp-hp">+{tempHp} Temp</span>}
        </div>

        <div className="hp-controls">
          <input
            type="number"
            min="1"
            placeholder="Amount..."
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value) || "")}
          />
          <button
            className="dmg-btn"
            onClick={() => handleHealthChange("damage")}
          >
            Damage
          </button>
          <button
            className="heal-btn"
            onClick={() => handleHealthChange("heal")}
          >
            Heal
          </button>
          <button
            className="temp-hp-btn"
            onClick={() => handleHealthChange("temp")}
          >
            Temp HP
          </button>
        </div>
      </div>

      {/* Death saves; only shown when unconscious */}
      {isUnconscious && (
        <div className="death-saves-block">
          <h3>Death Saves</h3>

          <div className="saves-row">
            <span>Successes:</span>
            {[1, 2, 3].map((num) => (
              <input
                key={`succ-${num}`}
                type="checkbox"
                checked={deathSaves.successes >= num}
                onChange={(e) => recordDeathSave("successes", e.target.checked)}
              />
            ))}
          </div>

          <div className="saves-row">
            <span>Failures:</span>
            {[1, 2, 3].map((num) => (
              <input
                key={`fail-${num}`}
                type="checkbox"
                checked={deathSaves.failures >= num}
                onChange={(e) => recordDeathSave("failures", e.target.checked)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick resting */}
      <div className="resting-controls">
        <button onClick={takeLongRest}>Long Rest</button>
        <button onClick={() => setShowShortRest(true)}>Short Rest</button>
      </div>

      {showShortRest && (
        <div className="modal-backdrop">
          <ShortRestModal onClose={() => setShowShortRest(false)} />
        </div>
      )}
    </div>
  );
};
