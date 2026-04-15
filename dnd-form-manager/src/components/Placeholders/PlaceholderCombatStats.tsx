import { CombatArmorClassBlock } from "./CombatArmorClassBlock";
import { CombatHitPointsBlock } from "./CombatHitPointsBlock";
import { CombatHitPointsTempBlock } from "./CombatHitPointsTempBlock";
import { CombatInitiativeBlock } from "./CombatInitiativeBlock";
import { CombatSpeedBlock } from "./CombatSpeedBlock";
import "./PlaceholderCombatStats.css";

export const PlaceholderCombatStats = () => {
  return (
    <div className="placeholder-combat-block placeholder">
      <div className="combat-item combat-item-armor-class">
        <CombatArmorClassBlock />
      </div>
      <div className="combat-item combat-item-initiative">
        <CombatInitiativeBlock />
      </div>
      <div className="combat-item combat-item-speed">
        <CombatSpeedBlock />
      </div>
      <div className="combat-item combat-item-hit-points">
        <CombatHitPointsBlock />
      </div>
      <div className="combat-item combat-item-hit-points-temp">
        <CombatHitPointsTempBlock />
      </div>
    </div>
  );
}