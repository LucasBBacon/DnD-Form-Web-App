import "./CharacterSheet.css";
import { ActionsBoard } from "../ActionsBoard/ActionsBoard.tsx";
import { CoreStatsBoard } from "../CoreStatsBoard/CoreStatsBoard.tsx";
import { IdentityHeader } from "../IdentityHeader/IdentityHeader.tsx";
import { InventoryBoard } from "../InventoryBoard/InventoryBoard.tsx";
import { RoleplayBoard } from "../RoleplayBoard/RoleplayBoard.tsx";
import { VitalsDashboard } from "../VitalsDashboard/VitalsDashboard.tsx";
import { CharacterSheetView } from "./CharacterSheetView.tsx";
import { SpellBookBoard } from "../SpellBookBoard/SpellBookBoard.tsx";

export const CharacterSheet = () => {
  return (
    <CharacterSheetView
      header={<IdentityHeader />}
      vitals={<VitalsDashboard />}
      stats={<CoreStatsBoard />}
      actions={<ActionsBoard />}
      inventory={<InventoryBoard />}
      roleplay={<RoleplayBoard />}
      spellbook={<SpellBookBoard />}
    />
  );
};
