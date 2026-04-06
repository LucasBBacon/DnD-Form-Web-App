import type { Ability } from "../../types/common";
import { formatAbilityModifier } from "../../utils/formattingUtils";
import "./AbilityScoresBlock.css";

const ABILITY_DISPLAY_ORDER: Array<{ key: Ability; name: string }> = [
  { key: "str", name: "strength" },
  { key: "dex", name: "dexterity" },
  { key: "con", name: "constitution" },
  { key: "int", name: "intelligence" },
  { key: "wis", name: "wisdom" },
  { key: "cha", name: "charisma" },
];

interface AbilityScoresBlockProps {
  scores: Record<Ability, number>;
  modifiers: Record<Ability, number>;
}

export const AbilityScoresBlock = ({
  scores,
  modifiers,
}: AbilityScoresBlockProps) => {
  return (
    <section className="ability-scores-block" aria-label="Ability Scores Block">
      {ABILITY_DISPLAY_ORDER.map((ability) => (
        <article key={ability.key} className="ability-score-card">
          <div className="ability-score-name">{ability.name}</div>
          <div className="ability-score-modifier">
            {formatAbilityModifier(modifiers[ability.key])}
          </div>
          <div className="ability-score-value">{scores[ability.key]}</div>
        </article>
      ))}
    </section>
  );
};
