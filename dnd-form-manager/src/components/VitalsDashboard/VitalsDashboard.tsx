import type React from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import { useState } from "react";
import { VitalsDashboardView } from "./VitalsDashboardView";

/**
 * Hook wrapper for VitalsDashboardView.
 * Handles all hook subscriptions and state management,
 * then passes everything to the presentational view component.
 */
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
    <VitalsDashboardView
      armorClass={armorClass}
      initiative={initiative}
      speed={speed}
      isArmorPenalized={isArmorPenalized}
      hp={hp}
      tempHp={tempHp}
      deathSaves={deathSaves}
      level={level}
      expendedHitDice={expendedHitDice}
      healthInput={healthInput}
      activeHealthMode={activeHealthMode}
      onHealthInputChange={setHealthInput}
      onHealthModeSelect={setActiveHealthMode}
      onHealthSubmit={handleHealthSubmit}
      onHealthCancel={() => setActiveHealthMode(null)}
      onTakeDamage={takeDamage}
      onHeal={heal}
      onSetTempHp={setTempHp}
      onRecordDeathSave={recordDeathSave}
      onShortRest={() => openRestModal("short")}
      onLongRest={() => openRestModal("long")}
    />
  );
};
