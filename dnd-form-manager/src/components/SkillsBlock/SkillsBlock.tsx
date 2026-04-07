import "./SkillsBlock.css";
import type { Skill, Ability } from "../../types/common";
import type { useSkills } from "../../hooks/useSkills";

type CalculatedSkills = ReturnType<typeof useSkills>["calculatedSkills"];

type SkillsBlockProps = {
  calculatedSkills: CalculatedSkills;
};

const formatName = (str: string) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const formatMod = (num: number) => {
  if (num === 0) return "0";
  return num > 0 ? `+${num}` : `${num}`;
};

const ABILITY_SHORT_LABELS: Record<Ability, string> = {
  str: "Str",
  dex: "Dex",
  con: "Con",
  int: "Int",
  wis: "Wis",
  cha: "Cha",
};

export const SkillsBlock = ({ calculatedSkills }: SkillsBlockProps) => {
  const sortedSkills = Object.entries(calculatedSkills).sort((a, b) => {
    const nameA = formatName(a[0]);
    const nameB = formatName(b[0]);
    return nameB.localeCompare(nameA);
  });

  return (
    <div className="skills-block" aria-label="Skills">
      <ul className="skills-list">
        {sortedSkills.map(([skillKey, skillData]) => {
          const skill = skillKey as Skill;
          const rowClassName = skillData.isProficient
            ? "skill-row proficient"
            : "skill-row";

          return (
            <li key={`skill-${skill}`} className={rowClassName}>
              <span
                className={
                  skillData.isProficient ? "skill-indicator filled" : "skill-indicator"
                }
                aria-hidden="true"
              />
              <span className="skill-value-wrap">
                <span className="skill-value">{formatMod(skillData.total)}</span>
              </span>
              <span className="skill-name-group">
                <span className="skill-name">{formatName(skill)}</span>{" "}
                <span className="skill-ability">({ABILITY_SHORT_LABELS[skillData.stat]})</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="skills-footer">SKILLS</div>
    </div>
  );
};
