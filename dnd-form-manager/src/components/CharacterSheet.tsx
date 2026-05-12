import "./CharacterSheet.css";
import { ActionsBoard } from "./ActionsBoard/ActionsBoard";
import { CoreStatsBoard } from "./CoreStatsBoard/CoreStatsBoard";
import { IdentityHeader } from "./IdentityHeader/IdentityHeader";
import { InventoryBoard } from "./InventoryBoard/InventoryBoard";
import { RoleplayBoard } from "./RoleplayBoard/RoleplayBoard";
import { VitalsDashboard } from "./VitalsDashboard/VitalsDashboard";
import { CharacterSheetView } from "./CharacterSheetView.tsx";

export const CharacterSheet = () => {
  return (
    <CharacterSheetView
      header={<IdentityHeader />}
      vitals={<VitalsDashboard />}
      stats={<CoreStatsBoard />}
      actions={<ActionsBoard />}
      inventory={<InventoryBoard />}
      roleplay={<RoleplayBoard />}
    />
  );
};
