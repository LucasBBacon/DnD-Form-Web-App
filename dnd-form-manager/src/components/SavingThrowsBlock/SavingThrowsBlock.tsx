import "./SavingThrowsBlock.css";
import { useSkills } from "../../hooks/useSkills";
import type { Ability } from "../../types/common";

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_LABELS: Record<Ability, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const formatMod = (num: number) => {
  if (num === 0) return "0";
  return num > 0 ? `+${num}` : `-${num}`;
};

export const SavingThrowsBlock = () => {
  const { calculatedSaves } = useSkills();

  const savesSection = (
    <div className="saves-block" aria-label="Saving Throws">
      <ul className="save-list">
        {ABILITIES.map((ability) => {
          const save = calculatedSaves[ability];
          const rowClassName = save.isProficient
            ? "save-row proficient"
            : "save-row";

          return (
            <li key={`save-${ability}`} className={rowClassName}>
              <span
                className={
                  save.isProficient ? "save-indicator filled" : "save-indicator"
                }
                aria-hidden="true"
              />
              <span className="save-value-wrap">
                <span className="save-value">{formatMod(save.total)}</span>
              </span>
              <span className="save-name">{ABILITY_LABELS[ability]}</span>
            </li>
          );
        })}
      </ul>
      <div className="save-footer">SAVING THROWS</div>
    </div>
  );

 
  return (
    <div className="skills-saves-container saves-only-view">{savesSection}</div>
  );
};
