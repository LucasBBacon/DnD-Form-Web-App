import { useMemo } from "react";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { SKILL_ABILITY_MAP } from "../utils/constants";
import { evaluateAllPredicates } from "../utils/predicateEngine";
import { formatProficiency } from "../utils/formattingUtils";

export const ProficienciesBlock = () => {
  const state = useCharacterStore();
  const derivedStats = useCharacterStats();

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
  );

  const nonSkillProficiencies = useMemo(() => {
    const profs = new Set<string>();

    // Add trait-driven proficiencies
    allTraits.forEach((trait) => {
      trait.effects?.forEach((effect) => {
        if (effect.type === "proficiency" && effect.target) {
          // Filter out skills
          if (Object.keys(SKILL_ABILITY_MAP).includes(effect.target)) return;

          const isActive = evaluateAllPredicates(
            effect.predicates,
            state,
            derivedStats,
          );
          if (isActive) {
            profs.add(effect.target);
          }
        }
      });
    });

    // Add manual choice proficiencies
    for (let i = 1; i <= state.level; i++) {
      const choice = state.choicesByLevel[i];
      if (choice?.weaponChoices)
        choice.weaponChoices.forEach((w) => profs.add(w));
      if (choice?.toolChoices) choice.toolChoices.forEach((t) => profs.add(t));
      if (choice?.languageChoices)
        choice.languageChoices.forEach((l) => profs.add(l));
    }

    return Array.from(profs);
  }, [allTraits, state, derivedStats]);

  // Group by category
  const groupedProficiencies = useMemo(() => {
    const groups: Record<string, string[]> = {
      "Armor": [],
      "Weapons": [],
      "Tools": [],
      "Languages & Other": [],
    };

    nonSkillProficiencies.forEach((profId) => {
      const { category, label } = formatProficiency(profId);
      if (groups[category]) {
        groups[category].push(label);
      } else {
        groups[category] = [label];
      }
    });

    return groups;
  }, [nonSkillProficiencies]);

  return (
    <div className="proficiencies-block">
      <h3>Proficiencies & Languages</h3>

      <div className="proficiencies-grid">
        {Object.entries(groupedProficiencies).map(([category, labels]) => {
          if (labels.length === 0) return null;

          return (
            <div key={category} className="proficiency-category">
              <h4>{category}</h4>
              <p>{labels.sort().join(", ")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
