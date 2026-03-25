import { useSkills } from "../hooks/useSkills";
import type { Ability, Skill } from "../types/common";

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

const formatName = (str: string) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const formatMod = (num: number) => (num >= 0 ? `+${num}` : `${num}`);

export const SkillAndSavesBlock = () => {
  const { calculatedSkills, calculatedSaves } = useSkills();

  return (
    <div className="skills-saves-container">
      {/* Saving Throws */}
      <div className="saves-block">
        <h3>Saving Throws</h3>
        <ul className="save-list">
          {ABILITIES.map((ability) => {
            const save = calculatedSaves[ability];
            return (
              <li
                key={`save-${ability}`}
                className={save.isProficient ? "proficient" : ""}
              >
                <span className="indicator">
                  {save.isProficient ? "●" : "○"}
                </span>
                <span className="mod">{formatMod(save.total)}</span>
                <span className="name">{ability.toUpperCase()}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Skills */}
      <div className="skills-block">
        <h3>Skills</h3>
        <ul className="skill-list">
          {Object.entries(calculatedSkills).map(([skillKey, skillData]) => {
            const skill = skillKey as Skill;

            // visual; double circle for expertise, filled for proficient, empty for normal
            let indicator = "○";
            if (skillData.isExpertise) indicator = "◉";
            else if (skillData.isProficient) indicator = "●";

            return (
              <li
                key={`skill-${skill}`}
                className={skillData.isProficient ? "proficient" : ""}
              >
                <span className="indicator">{indicator}</span>
                <span className="mod">{formatMod(skillData.total)}</span>
                <span className="name">{formatName(skill)}</span>
                <span className="stat-tag">
                  ({skillData.stat.toUpperCase()})
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
