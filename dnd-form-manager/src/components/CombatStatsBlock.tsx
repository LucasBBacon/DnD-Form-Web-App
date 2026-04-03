import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";

export const CombatStatsBlock = () => {
  // Grab actions directly from zustand to trigger changes
  const levelUp = useCharacterStore((state) => state.setLevel);
  const currentLevel = useCharacterStore((state) => state.level);

  // Grab the fully calculated math from the custom hook
  const { maxHp, initiative, armorClass, proficiencyBonus } = useCharacterStats();

  return (
    <div className="combat-stats-container">
      <h2>Combat Stats</h2>

      <div className="stat-grid">
        <div className="stat-box">
          <label>Armor Class </label>
          <span>{armorClass}</span>
        </div>

        <div className="stat-box">
          <label>Initiative </label>
          <span>{initiative >= 0 ? `+${initiative}` : initiative}</span>
        </div>

        <div className="stat-box">
          <label>Max HP </label>
          <span>{maxHp}</span>
        </div>

        <div className="stat-box">
          <label>Proficiency </label>
          <span>+{proficiencyBonus}</span>
        </div>
      </div>

      <button onClick={() => levelUp(currentLevel + 1)}>
        Level Up (Current: {currentLevel})
      </button>
    </div>
  );
};
