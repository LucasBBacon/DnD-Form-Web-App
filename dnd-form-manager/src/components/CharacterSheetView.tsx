import type React from "react";
import "./CharacterSheet.css";

export interface CharacterSheetViewProps {
  header: React.ReactNode;
  vitals: React.ReactNode;
  stats: React.ReactNode;
  actions: React.ReactNode;
  inventory: React.ReactNode;
  roleplay: React.ReactNode;
  spellbook: React.ReactNode;
}

export const CharacterSheetView: React.FC<CharacterSheetViewProps> = ({
  header,
  vitals,
  stats,
  actions,
  inventory,
  roleplay,
  spellbook,
}) => {
  return (
    <div className="character-sheet-layout">
      <div className="sheet-area-header">{header}</div>
      <div className="sheet-area-stats">{stats}</div>
      <div className="sheet-area-vitals">{vitals}</div>
      <div className="sheet-area-actions">{actions}</div>
      <div className="sheet-area-inventory">{inventory}</div>
      <div className="sheet-area-roleplay">{roleplay}</div>
      <div className="sheet-area-spellbook">{spellbook}</div>
    </div>
  );
};
