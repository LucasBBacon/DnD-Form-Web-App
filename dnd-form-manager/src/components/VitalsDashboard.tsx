import type React from "react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useState } from "react";
import "./VitalsDashboard.css";

export const VitalsDashboard: React.FC = () => {
  // Mutable state and actions
  const {
    level,
    tempHp,
    deathSaves,
    expendedHitDice,
    takeDamage,
    heal,
    setTempHp,
    recordDeathSave,
    expendHitDie,
  } = useCharacterStore();

  // Derive stats from engine
  const { combat } = useCharacterStats();
  const { armorClass, initiative, speed, isArmorPenalized, hp } = combat;

  // Local state for the Health adjustment popover/input
  const [healthInput, setHealthInput] = useState<number | "">("");
  const [activeHealthMode, setActiveHealthMode] = useState<
    "damage" | "heal" | "temp" | null
  >(null);

  const handleHealthSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const amount = Number(healthInput);
    if (amount > 0) {
      if (activeHealthMode === "damage") takeDamage(amount);
      if (activeHealthMode === "heal") heal(amount);
      if (activeHealthMode === "temp") setTempHp(amount);
    }

    setHealthInput("");
    setActiveHealthMode(null);
  };

  return (
    <section className="vitals-dashboard card">
      {/* quick combat stats */}
      <div className="vitals-top-row">
        <div
          className="stat-badge shield"
          title={isArmorPenalized ? "Stealth Disadvantage!" : "Armor Class"}
        >
          <span className="stat-value">
            {armorClass}
            {/* show warning icon if armor penalized */}
            {isArmorPenalized && <span className="warning-icon">⚠️</span>}
          </span>
          <span className="stat-label">ARMOR CLASS</span>
        </div>
        <div className="stat-badge">
          <span className="stat-value">
            {initiative >= 0 ? `+${initiative}` : initiative}
          </span>
          <span className="stat-label">INITIATIVE</span>
        </div>
        <div className="stat-badge">
          <span className="stat-value">{speed}</span>
          <span className="stat-label">SPEED</span>
        </div>
      </div>

      {/* health block */}
      <div className="health-block">
        <div className="hp-display">
          <div className="current-hp">
            <span className="label">CURRENT HP</span>
            <span className="value">{hp.current}</span>
          </div>
          <div className="max-hp">
            <span className="label">MAX HP</span>
            <span className="value">{hp.max}</span>
          </div>
          {tempHp > 0 && (
            <div className="temp-hp">
              <span className="label">TEMP</span>
              <span className="value">{tempHp}</span>
            </div>
          )}
        </div>

        {/* health actions form */}
        <div className="health-actions">
          {activeHealthMode ? (
            <form className="health-input-form" onSubmit={handleHealthSubmit}>
              <input
                type="number"
                autoFocus
                placeholder={`Enter ${activeHealthMode} amount`}
                value={healthInput}
                onChange={(e) => setHealthInput(parseInt(e.target.value) || "")}
              />
              <button
                type="submit"
                className={`confirm-btn ${activeHealthMode}`}
              >
                Apply
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setActiveHealthMode(null)}
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="health-buttons">
              <button
                className="btn-damage"
                onClick={() => setActiveHealthMode("damage")}
              >
                Damage
              </button>
              <button
                className="btn-heal"
                onClick={() => setActiveHealthMode("heal")}
              >
                Heal
              </button>
              <button
                className="btn-temp"
                onClick={() => setActiveHealthMode("temp")}
              >
                Temp HP
              </button>
            </div>
          )}
        </div>
      </div>

      {/* hit dice and death saves */}
      <div className="vitals-bottom-row">
        <div className="hit-dice-block">
          <div className="block-header">
            <span>HIT DICE</span>
            <span>
              {level - expendedHitDice} / {level}
            </span>
          </div>
          <button
            disabled={expendedHitDice >= level}
            onClick={expendHitDie}
            className="expend-dice-btn"
          >
            Expend Hit Die
          </button>
        </div>

        {hp.current === 0 && (
          <div className="death-saves-block">
            <div className="block-header">DEATH SAVES</div>
            <div className="saves-row successes">
              <span>SUCCESS</span>
              {[1, 2, 3].map((num) => (
                <input
                  key={`succ-${num}`}
                  type="checkbox"
                  checked={deathSaves.successes >= num}
                  onChange={(e) =>
                    recordDeathSave("successes", e.target.checked)
                  }
                />
              ))}
            </div>
            <div className="saves-row failures">
              <span>FAILURES</span>
              {[1, 2, 3].map((num) => (
                <input
                  key={`fail-${num}`}
                  type="checkbox"
                  checked={deathSaves.failures >= num}
                  onChange={(e) =>
                    recordDeathSave("failures", e.target.checked)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
