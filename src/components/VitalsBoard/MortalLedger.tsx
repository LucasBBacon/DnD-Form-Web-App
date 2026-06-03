import type React from "react";
import "./MortalLedger.css";
import { CombatDefenses } from "./ui/CombatDefenses";
import { DeathSaves } from "./ui/DeathSaves";
import { HealthLedger } from "./ui/HealthLedger";
import { RestAndRecovery } from "./ui/RestAndRecovery";

// #region Types and Interfaces

export interface HitDicePool {
  /* The face value of the die */
  sides: number;
  /* Total number of this specific hit die available */
  total: number;
  /* Number of this specific hit die currently expended */
  expended: number;
}

/**
 * Props for the VitalsDashboardView presentational component.
 * All data is passed as props; no hooks are used.
 */
export interface MortalLedgerProps {
  /** Armor class of the character */
  armorClass: number;
  /** Initiative bonus of the character */
  initiative: number;
  /** Speed of the character */
  speed: number;
  /** Whether the character's armor imposes a penalty */
  isArmorPenalized: boolean;

  /** Current and maximum hit points of the character */
  hp: {
    /** Current hit points */
    current: number;
    /** Maximum hit points */
    max: number;
  };
  /** Temporary hit points of the character */
  tempHp: number;

  /** Death saves of the character */
  deathSaves: {
    /** Number of successful death saves */
    success: number;
    /** Number of failed death saves */
    failure: number;
  };

  /** Level of the character */
  level: number;
  /** Number of hit dice expended */
  hitDicePools: HitDicePool[];

  // Callbacks
  onTakeDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onSetTempHp: (amount: number) => void;
  onRecordSave: (type: "success" | "failure", count: number) => void;

  onSpendHitDie: (sides: number) => void;
  onShortRest: () => void;
  onLongRest: () => void;
}

// #endregion

export const MortalLedger: React.FC<MortalLedgerProps> = ({
  armorClass,
  initiative,
  speed,
  isArmorPenalized,
  hp,
  tempHp,
  deathSaves,
  hitDicePools,
  onTakeDamage,
  onHeal,
  onSetTempHp,
  onRecordSave,
  onSpendHitDie,
  onShortRest,
  onLongRest,
}) => {
  const isDying = hp.current <= 0;

  return (
    <div className="mortal-ledger-wrapper">
      {/* HEADER */}
      <div className="ledger-header">
        <h2 className="manuscript-section-title">Vitals</h2>
        <hr className="ornate-board-divider" />
      </div>

      <div className="ledger-content">
        {/* DEFENSES */}
        <CombatDefenses
          armorClass={armorClass}
          initiative={initiative}
          speed={speed}
          isArmorPenalized={isArmorPenalized}
        />

        {/* HEALTH & DEATH SAVES */}
        <div className="mortal-focus-area">
          {isDying ? (
            <DeathSaves
              success={deathSaves.success}
              failure={deathSaves.failure}
              onRecordSave={onRecordSave}
            />
          ) : (
            <HealthLedger
              hp={hp}
              tempHp={tempHp}
              onTakeDamage={onTakeDamage}
              onHeal={onHeal}
              onSetTempHp={onSetTempHp}
            />
          )}
        </div>

        {/* RECOVERY */}
        <RestAndRecovery
          hitDicePools={hitDicePools}
          onSpendHitDie={onSpendHitDie}
          onShortRest={onShortRest}
          onLongRest={onLongRest}
        />
      </div>
    </div>
  );
};
