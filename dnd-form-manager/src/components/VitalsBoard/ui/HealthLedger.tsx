import type React from "react";
import { useEffect, useRef, useState } from "react";
import "./HealthLedger.css";
import { Heart, HeartHandshake, ShieldPlus, Swords } from "lucide-react";

export interface HealthLedgerProps {
  hp: {
    current: number;
    max: number;
  };
  tempHp: number;
  onTakeDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onSetTempHp: (amount: number) => void;
}

export const HealthLedger: React.FC<HealthLedgerProps> = ({
  hp,
  tempHp,
  onTakeDamage,
  onHeal,
  onSetTempHp,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inputValue, setInputValue] = useState<number | "">("");

  // Auto-focus when the drawer opens
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isDrawerOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDrawerOpen]);

  const isBloodied = hp.current <= hp.max / 4;

  const handleAction = (type: "damage" | "heal" | "temp") => {
    if (inputValue === "" || inputValue <= 0) return;

    if (type === "damage") onTakeDamage(inputValue);
    if (type === "heal") onHeal(inputValue);
    if (type === "temp") onSetTempHp(inputValue);

    // Reset and close after action
    setInputValue("");
    setIsDrawerOpen(false);
  };

  // allow pressing enter to quickly take damage
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAction("damage");
    }
    if (e.key === "Escape") {
      setIsDrawerOpen(false);
    }
  };

  return (
    <div className="health-ledger-container">
      {/* Main Display */}
      <div
        className={`health-display-card ${isBloodied ? "is-bloodied" : ""}`}
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        title="Click to adjust hit points"
      >
        <div className="hp-label-group">
          <Heart
            size={16}
            className={`hp-icon ${isBloodied ? "beat-animation" : ""}`}
          />
          <span className="hp-label">Hit Points</span>
        </div>

        <div className="hp-numbers-group">
          <span className="hp-current">{hp.current}</span>
          <span className="hp-slash">/</span>
          <span className="hp-max">{hp.max}</span>
        </div>

        {/* Temp HP */}
        {tempHp > 0 && (
          <div className="temp-hp-ward">
            <ShieldPlus size={14} />
            <span>{tempHp} Temp</span>
          </div>
        )}
      </div>

      {/* Inline Drawer */}
      {isDrawerOpen && (
        <div className="health-drawer fadeInDown">
          <input
            ref={inputRef}
            type="number"
            className="manuscript-input health-amount-input"
            placeholder="Amount..."
            value={inputValue}
            onChange={(e) =>
              setInputValue(
                e.target.value === ""
                  ? ""
                  : Math.max(1, parseInt(e.target.value)),
              )
            }
            onKeyDown={handleKeyDown}
            min="1"
          />

          <div className="health-drawer-actions">
            <button
              className="action-btn damage-btn"
              onClick={() => handleAction("damage")}
              disabled={inputValue === ""}
            >
              <Swords size={14} /> Damage
            </button>
            <button
              className="action-btn heal-btn"
              onClick={() => handleAction("heal")}
              disabled={inputValue === "" || hp.current >= hp.max}
            >
              <HeartHandshake size={14} /> Heal
            </button>
            <button
              className="action-btn temp-btn"
              onClick={() => handleAction("temp")}
              disabled={inputValue === ""}
            >
              <ShieldPlus size={14} /> Temp HP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
