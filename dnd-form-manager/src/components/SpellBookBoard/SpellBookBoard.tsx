import type React from "react";
import { useSpellcasting } from "../../hooks/useSpellcasting";
import { SpellBookView } from "../SpellBookView/SpellBookView";

export const SpellBookBoard: React.FC = () => {
  const spellcasting = useSpellcasting();

  return <SpellBookView spellcasting={spellcasting} />;
};
