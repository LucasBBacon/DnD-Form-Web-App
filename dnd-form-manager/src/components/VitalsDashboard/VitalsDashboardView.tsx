import type React from "react";
import "./VitalsDashboard.css";
import { StatBadge } from "./ui/StatBadge";
import { HpDisplay } from "./ui/HpDisplay";
import { HealthAdjustmentForm } from "./ui/HealthAdjustmentForm";
import { HitDiceBlock } from "./ui/HitDiceBlock";
import { DeathSavesTracker } from "./ui/DeathSavesTracker";

/**
 * Props for the VitalsDashboardView presentational component.
 * All data is passed as props; no hooks are used.
 */
export interface VitalsDashboardViewProps {
  // Combat stats
  armorClass: number;
  initiative: number;
  speed: number;
  isArmorPenalized: boolean;

  // HP state
  hp: {
    current: number;
    max: number;
  };
  tempHp: number;

  // Death saves
  deathSaves: {
    successes: number;
    failures: number;
  };

  // Hit dice
  level: number;
  expendedHitDice: number;

  // Local form state
  healthInput: number | "";
  activeHealthMode: "damage" | "heal" | "temp" | null;

  // Callbacks
  onHealthInputChange: (value: number | "") => void;
  onHealthModeSelect: (mode: "damage" | "heal" | "temp" | null) => void;
  onHealthSubmit: (e: React.SubmitEvent) => void;
  onHealthCancel: () => void;
  onTakeDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onSetTempHp: (amount: number) => void;
  onRecordDeathSave: (type: "success" | "failure", checked: boolean) => void;
  onShortRest: () => void;
  onLongRest: () => void;
}

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
            successes={deathSaves.successes}
            failures={deathSaves.failures}
            onToggle={onRecordDeathSave}
          />
        )}
      </div>
    </section>
  );
};
