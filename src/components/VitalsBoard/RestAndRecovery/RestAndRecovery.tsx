import type React from "react";
import "./RestAndRecovery.css";
import type { HitDicePool } from "../MortalLedger";
import { useState } from "react";
import { Moon, SunMoon, Tent } from "lucide-react";
import {
  DiceRoller,
  type DiceRollSummary,
} from "../../ui/DiceRoller/DiceRoller";
import type { DieType } from "../../ui/DiceRoller/PolyDie";

export interface RestAndRecoveryProps {
  hitDicePools: HitDicePool[];
  onSpendHitDie: (sides: number, rollTotal: number) => void;
  onShortRest: () => void;
  onLongRest: () => void;
}

export const RestAndRecovery: React.FC<RestAndRecoveryProps> = ({
  hitDicePools,
  onSpendHitDie,
  onShortRest,
  onLongRest,
}) => {
  const [isCampOpen, setIsCampOpen] = useState(false);

  // calculate aggregate totals for closed summary
  const totalDice = hitDicePools.reduce((acc, pool) => acc + pool.total, 0);
  const availableDice = hitDicePools.reduce(
    (acc, pool) => acc + (pool.total - pool.expended),
    0,
  );

  // filter out any empty pools
  const activePools = hitDicePools.filter((pool) => pool.total > 0);

  const handleSpendDie = (
    sides: number,
    summary: DiceRollSummary,
    available: number,
  ) => {
    if (available > 0) {
      onSpendHitDie(sides, summary.total);
    }
  };

  return (
    <div className="rest-recovery-container">
      {/* Toggle Camp */}
      <button
        className={`camp-toggle-btn ${isCampOpen ? "is-open" : ""}`}
        onClick={() => setIsCampOpen(!isCampOpen)}
      >
        <div className="camp-toggle-info">
          <Tent size={16} className="camp-icon" />
          <span className="camp-label">Rest & Recovery</span>
        </div>
        <div className="hit-dice-summary">
          <span className="summary-text">Hit Dice:</span>
          <span className="summary-numbers">
            {availableDice} / {totalDice}
          </span>
        </div>
      </button>

      {/* CAMP DRAWER */}
      {isCampOpen && (
        <div className="camp-drawer fadeInDown">
          <div className="camp-drawer-header">
            <SunMoon size={16} className="header-icon" />
            <span>Spend Hit Dice</span>
          </div>

          <div className="hit-dice-pools">
            {activePools.map((pool) => {
              const available = pool.total - pool.expended;
              const isDepleted = available <= 0;

              return (
                <div
                  key={pool.sides}
                  className={`hit-die-row ${isDepleted ? "is-depleted" : ""}`}
                >
                  <div className="die-stamp">d{pool.sides}</div>
                  <div className="die-count">
                    {available} <span className="count-slash">/</span>{" "}
                    {pool.total}
                  </div>
                  <div className="die-roller-slot">
                    <DiceRoller
                      sides={pool.sides as DieType}
                      count={1}
                      rollLabel="Spend"
                      disabled={isDepleted}
                      onRollComplete={(_, summary) =>
                        handleSpendDie(pool.sides, summary, available)
                      }
                      className="hit-die-roller"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="filigree-divider" />

          <div className="rest-actions">
            <button className="action-btn short-rest-btn" onClick={onShortRest}>
              <SunMoon size={14} /> Finish Short Rest
            </button>
            <button className="action-btn long-rest-btn" onClick={onLongRest}>
              <Moon size={14} /> Take Long Rest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
