import { CoreStatsBoard } from "./CoreStatsBoard";
import { IdentityHeader } from "./IdentityHeader";
import { VitalsDashboard } from "./VitalsDashboard";

export const CharacterSheet = () => {
  return (
    <div className="character-sheet-layout">
      <div
        className="sheet-canvas"
        aria-label="Character Sheet"
      >
        <IdentityHeader />
        <VitalsDashboard />
      </div>
        <CoreStatsBoard />
    </div>
  );
};
