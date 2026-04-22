import { useState } from "react";
import { useSkills } from "../hooks/useSkills";
import { IdentityHeader } from "./IdentityHeader";

export const CharacterSheet = () => {
  return (
    <div className="character-sheet-layout">
      <div
        className="sheet-canvas"
        aria-label="Character Sheet"
      >
        <IdentityHeader />
      </div>
    </div>
  );
};
