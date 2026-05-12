import type React from "react";
import "./VitalsDashboard.css";
import { StatBadge } from "./ui/StatBadge";
import { HpDisplay } from "./ui/HpDisplay";
import { HealthAdjustmentForm } from "./ui/HealthAdjustmentForm";
import { HitDiceBlock } from "./ui/HitDiceBlock";
import { DeathSavesTracker } from "./ui/DeathSavesTracker";


// #region Types and Interfaces

/**
 * Props for the VitalsDashboardView presentational component.
 * All data is passed as props; no hooks are used.
 */
export interface VitalsDashboardViewProps {
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
  expendedHitDice: number;

  /** Current value of the health input field */
  healthInput: number | "";
  /** Currently active health adjustment mode */
  activeHealthMode: "damage" | "heal" | "temp" | null;

  // Callbacks
  /** Callback for when the health input value changes */
  onHealthInputChange: (value: number | "") => void;
  /** Callback for when a health adjustment mode is selected */
  onHealthModeSelect: (mode: "damage" | "heal" | "temp" | null) => void;
  /** Callback for when the health form is submitted */
  onHealthSubmit: (e: React.SubmitEvent) => void;
  /** Callback for when the health form is canceled */
  onHealthCancel: () => void;
  /** Callback for when damage is taken */
  onTakeDamage: (amount: number) => void;
  /** Callback for when healing is applied */
  onHeal: (amount: number) => void;
  /** Callback for when temporary hit points are set */
  onSetTempHp: (amount: number) => void;
  /** Callback for when a death save is recorded */
  onRecordDeathSave: (type: "success" | "failure", checked: boolean) => void;
  /** Callback for when a short rest is taken */
  onShortRest: () => void;
  /** Callback for when a long rest is taken */
  onLongRest: () => void;
}

// #endregion

// #region View Component
/**
 * Presentational component for the VitalsDashboard.
 * Renders UI given all data and callbacks as props.
 * No hooks or external dependencies.
 */
export const VitalsDashboardView: React.FC<VitalsDashboardViewProps> = ({
  // Combat stats
  armorClass,
  initiative,
  speed,
  isArmorPenalized,
  // HP state
  hp,
  tempHp,
  // Death saves
  deathSaves,
  // Hit dice
  level,
  expendedHitDice,
  // Local form state
  healthInput,
  activeHealthMode,
  // Callbacks
  onHealthInputChange,
  onHealthModeSelect,
  onHealthSubmit,
  onHealthCancel,
  onTakeDamage,
  onHeal,
  onSetTempHp,
  onRecordDeathSave,
  onShortRest,
  onLongRest,
}) => {
  return (
    <section className="vitals-dashboard card">
      {/* quick combat stats */}
      <div className="vitals-top-row">
        <StatBadge
          label="ARMOR CLASS"
          value={armorClass}
          className="shield"
          title={isArmorPenalized ? "Stealth Disadvantage!" : "Armor Class"}
          warning={isArmorPenalized}
        />
        <StatBadge
          label="INITIATIVE"
          value={initiative >= 0 ? `+${initiative}` : initiative}
        />
        <StatBadge label="SPEED" value={speed} />
      </div>

      {/* health block */}
      <div className="health-block">
        <HpDisplay current={hp.current} max={hp.max} temp={tempHp} />
        <HealthAdjustmentForm
          activeMode={activeHealthMode}
          inputValue={healthInput}
          onInputChange={onHealthInputChange}
          onSubmit={onHealthSubmit}
          onModeSelect={onHealthModeSelect}
          onCancel={onHealthCancel}
        />
      </div>

      {/* hit dice and death saves */}
      <div className="vitals-bottom-row">
        <HitDiceBlock
          available={level - expendedHitDice}
          total={level}
          onShortRest={onShortRest}
          onLongRest={onLongRest}
        />
        {hp.current === 0 && (
          <DeathSavesTracker
            success={deathSaves.success}
            failure={deathSaves.failure}
            onToggle={onRecordDeathSave}
          />
        )}
      </div>
    </section>
  );
};

// #endregion
