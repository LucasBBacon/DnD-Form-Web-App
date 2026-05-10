import type React from "react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useState } from "react";
import "./VitalsDashboard.css";
import { StatBadge } from "./VitalsDashboard/ui/StatBadge";
import { HpDisplay } from "./VitalsDashboard/ui/HpDisplay";
import { HealthAdjustmentForm } from "./VitalsDashboard/ui/HealthAdjustmentForm";
import { HitDiceBlock } from "./VitalsDashboard/ui/HitDiceBlock";
import { DeathSavesTracker } from "./VitalsDashboard/ui/DeathSavesTracker";

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
    openRestModal,
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
          onInputChange={setHealthInput}
          onSubmit={handleHealthSubmit}
          onModeSelect={setActiveHealthMode}
          onCancel={() => setActiveHealthMode(null)}
        />
      </div>

      {/* hit dice and death saves */}
      <div className="vitals-bottom-row">
        <HitDiceBlock
          available={level - expendedHitDice}
          total={level}
          onShortRest={() => openRestModal("short")}
          onLongRest={() => openRestModal("long")}
        />
        {hp.current === 0 && (
          <DeathSavesTracker
            successes={deathSaves.successes}
            failures={deathSaves.failures}
            onToggle={(type, checked) => recordDeathSave(type, checked)}
          />
        )}
      </div>
    </section>
  );
};
