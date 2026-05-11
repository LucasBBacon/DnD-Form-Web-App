import "./CharacterSheet.css";
import { ActionsBoard } from "./ActionsBoard/ActionsBoard";
import { CoreStatsBoard } from "./CoreStatsBoard/CoreStatsBoard";
import { IdentityHeader } from "./IdentityHeader/IdentityHeader";
import { InventoryBoard } from "./InventoryBoard/InventoryBoard";
import { RoleplayBoard } from "./RoleplayBoard/RoleplayBoard";
import { VitalsDashboard } from "./VitalsDashboard/VitalsDashboard";

export const CharacterSheet = () => {
  return (
    <div className="character-sheet-layout">
      <div className="sheet-area-header">
        <IdentityHeader />
      </div>
      <div className="sheet-area-stats">
        <VitalsDashboard />
      </div>
      <div className="sheet-area-vitals">
        <CoreStatsBoard />
      </div>
      <div className="sheet-area-actions">
        <ActionsBoard />
      </div>
      <div className="sheet-area-inventory">
        <InventoryBoard />
      </div>
      <div className="sheet-area-roleplay">
        <RoleplayBoard />
      </div>
    </div>
  );
};
