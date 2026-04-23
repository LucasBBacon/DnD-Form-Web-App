import type React from "react";
import type { Ability, Skill } from "../types/common";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useSkills } from "../hooks/useSkills";
import "./CoreStatsBoard.css"

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

const ABILITY_NAMES: Record<Ability, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const formatSkillName = (str: string) => {
  const spaced = str.replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const CoreStatsBoard: React.FC = () => {
  const { abilities } = useCharacterStats();
  const { calculatedSkills, calculatedSaves, proficiencyBonus, passives } =
    useSkills();

  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  return (
    <section className="core-stats-container">
      {/* PB and passives */}
      <div className="stats-top-bar">
        <div className="badge-pill">
          <span className="label">PROFICIENCY BONUS</span>
          <span className="value">{formatMod(proficiencyBonus)}</span>
        </div>
        <div className="passives-group">
          <div className="badge-pill" title="Passive Perception">
            <span className="icon">👁️</span>
            <span className="value">{passives.perception}</span>
          </div>
          <div className="badge-pill" title="Passive Investigation">
            <span className="icon">🔍</span>
            <span className="value">{passives.investigation}</span>
          </div>
          <div className="badge-pill" title="Passive Insight">
            <span className="icon">💡</span>
            <span className="value">{passives.insight}</span>
          </div>
        </div>
      </div>

      {/* Ability cards */}
      <div className="ability-grid">
        {ABILITIES.map((ability) => {
          const score = abilities.scores[ability];
          const modifier = abilities.modifiers[ability];

          // filter saves/skills for this specific block
          const save = calculatedSaves[ability];
          const skillsForAbility = Object.entries(calculatedSkills).filter(
            ([_, skillData]) => skillData.stat === ability,
          ) as [Skill, (typeof calculatedSkills)[Skill]][];

          return (
            <div key={ability} className="ability-card">
              {/* Ability header */}
              <div className="ability-header">
                <div className="ability-name">
                  {ABILITY_NAMES[ability].toUpperCase()}
                </div>
                <div className="ability-score-block">
                  <span className="score">{score}</span>
                  <span className="modifier">{formatMod(modifier)}</span>
                </div>
              </div>

              <div className="ability-details">
                {/* Saving throw */}
                <div className="skill-row save-row">
                  <span
                    className={`prof-dot ${save?.isProficient ? "active" : ""}`}
                  ></span>
                  <span className="skill-mod">
                    {formatMod(save?.total || modifier)}
                  </span>
                  <span className="skill-name">Saving Throw</span>
                </div>

                <hr className="divider" />

                {/* Skills */}
                {skillsForAbility.length > 0 ? (
                  skillsForAbility.map(([skillKey, skillData]) => {
                    const hasAdvantage = skillData.advantageSources.length > 0;
                    const hasDisadvantage =
                      skillData.disadvantageSources.length > 0;
                    let tooltipMsg = "";
                    if (hasAdvantage)
                      tooltipMsg += `Advantage: ${skillData.advantageSources.join(", ")}\n`;
                    if (hasDisadvantage)
                      tooltipMsg += `Disadvantage: ${skillData.disadvantageSources.join(", ")}\n`;

                    return (
                      <div
                        key={skillKey}
                        className="skill-row"
                        title={tooltipMsg.trim()}
                      >
                        {/* using classes to denote proficiency vs expertise */}
                        <span
                          className={`prof-dot ${skillData.isProficient ? "active" : ""} ${skillData.isExpertise ? "expertise" : ""}`}
                        ></span>
                        <span className="skill-mod">
                          {formatMod(skillData.total)}
                        </span>
                        <span className="skill-name">
                          {formatSkillName(skillKey as string)}
                          {hasAdvantage && (
                            <span className="adv-indicator"> (A)</span>
                          )}
                          {hasDisadvantage && (
                            <span className="dis-indicator"> (D)</span>
                          )}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-skill-msg">No associated skills</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
