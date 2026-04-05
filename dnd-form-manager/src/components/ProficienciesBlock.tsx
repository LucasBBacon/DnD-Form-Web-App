import { useMemo } from "react";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { formatProficiency } from "../utils/formattingUtils";
import { aggregateNonSkillProficiencies } from "../utils/proficiencyAggregator";

export const ProficienciesBlock = () => {
  const state = useCharacterStore();
  const derivedStats = useCharacterStats();

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    false,
    state.choicesByLevel,
  );

  const nonSkillProficiencies = useMemo(() => {
    const aggregated = aggregateNonSkillProficiencies({
      choicesByLevel: state.choicesByLevel,
      currentLevel: state.level,
      traits: allTraits,
      state,
      stats: derivedStats,
    });

    return [
      ...aggregated.armor.list,
      ...aggregated.weapons.list,
      ...aggregated.tools.list,
      ...aggregated.languagesAndOther.list,
    ];
  }, [allTraits, state, derivedStats]);

  // Group by category
  const groupedProficiencies = useMemo(() => {
    const groups: Record<string, string[]> = {
      Armor: [],
      Weapons: [],
      Tools: [],
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
