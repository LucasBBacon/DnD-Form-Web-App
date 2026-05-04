import React from "react";
import type { ClassData } from "../../../types/class";
import type { Skill } from "../../../types/common";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { PendingProficiencyChoice } from "../../../utils/choiceUtils";
import {
  resolveSkillChoicePool,
  resolveProficiencyChoicePool,
} from "../../../utils/choiceUtils";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";

// #region --- Utilities ---

const getSelectionKey = (group: PendingProficiencyChoice): string =>
  `${group.category}:${group.sourceId}`;

const toSelectionPool = (group: PendingProficiencyChoice): string[] =>
  group.category === "skills"
    ? resolveSkillChoicePool(group.pool as Skill[] | "any")
    : resolveProficiencyChoicePool(group.category as never, group.pool);

// #endregion

// #region --- Types ---

interface ProficiencyChoiceStepProps {
  /** The current draft of the level-up process */
  draft: LevelUpDraft;
  /** Callback to update the draft with new values */
  onUpdateDraft: (updates: Partial<LevelUpDraft>) => void;
  /** The result of the level-up planner */
  plan: LevelUpPlannerResult;
  /** Data for the currently selected class */
  classData: ClassData | null;
  /** Data for the currently selected subclass */
  subclassData: SubclassData | null;
}

// #endregion

// #region --- Skill Choice Component ---

/**
 * Renders a group of skill choices for the user to select from.
 * @param param0 - The props for the SkillChoiceGroup component.
 * @returns A JSX element representing the skill choice group.
 */
function SkillChoiceGroup({
  group,
  selected,
  onChange,
}: {
  group: PendingProficiencyChoice;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const pool = toSelectionPool(group);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val));
    } else if (selected.length < group.count) {
      onChange([...selected, val]);
    }
  };

  // #region --- Render ---

  return (
    <div style={{ marginBottom: "1rem" }}>
      <p className="level-up-step__section-label">
        {group.sourceName} — choose {group.count}
      </p>
      <ul className="level-up-step__option-list">
        {pool.map((val) => {
          const isChecked = selected.includes(val);
          const isDisabled = !isChecked && selected.length >= group.count;
          return (
            <li key={val}>
              <label
                className={[
                  "level-up-step__option",
                  isChecked ? "level-up-step__option--selected" : "",
                  isDisabled ? "level-up-step__option--disabled" : "",
                ]
                  .join(" ")
                  .trim()}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => toggle(val)}
                />
                <span className="level-up-step__option-label">
                  {val.replace(/_/g, " ")}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );

  // #endregion
}

// #endregion

export const ProficiencyChoiceStep: React.FC<ProficiencyChoiceStepProps> = ({
  draft,
  onUpdateDraft,
  plan,
}) => {

  // #region Pending Choices

  const { pendingProficiencyChoices } = plan;

  const skillGroups = pendingProficiencyChoices.filter(
    (c) => c.category === "skills",
  );
  const weaponGroups = pendingProficiencyChoices.filter(
    (c) => c.category === "weapons",
  );
  const toolGroups = pendingProficiencyChoices.filter(
    (c) => c.category === "tools",
  );
  const langGroups = pendingProficiencyChoices.filter(
    (c) => c.category === "languages",
  );

  // #endregion

  const updateSourceSelections = (
    group: PendingProficiencyChoice,
    next: string[],
  ) => {
    const key = getSelectionKey(group);
    const nextBySource = {
      ...draft.proficiencySelectionsBySource,
      [key]: next,
    };

    // #region --- Recalculate Overall Selections ---

    const skillChoices = new Set<Skill>();
    const weaponChoices = new Set<string>();
    const toolChoices = new Set<string>();
    const languageChoices = new Set<string>();

    pendingProficiencyChoices.forEach((choice) => {
      const selectionKey = getSelectionKey(choice);
      const selected = nextBySource[selectionKey] ?? [];
      const pool = toSelectionPool(choice);
      const validSelected = selected.filter(
        (value) => pool.length === 0 || pool.includes(value),
      );

      if (choice.category === "skills") {
        validSelected.forEach((value) => skillChoices.add(value as Skill));
      }
      if (choice.category === "weapons") {
        validSelected.forEach((value) => weaponChoices.add(value));
      }
      if (choice.category === "tools") {
        validSelected.forEach((value) => toolChoices.add(value));
      }
      if (choice.category === "languages") {
        validSelected.forEach((value) => languageChoices.add(value));
      }
    });

    // #endregion

    onUpdateDraft({
      proficiencySelectionsBySource: nextBySource,
      skillChoices: Array.from(skillChoices),
      weaponChoices: Array.from(weaponChoices),
      toolChoices: Array.from(toolChoices),
      languageChoices: Array.from(languageChoices),
    });
  };

  // #region --- Render ---

  if (pendingProficiencyChoices.length === 0) {
    return (
      <div className="level-up-step">
        <h3 className="level-up-step__title">Proficiencies</h3>
        <p className="level-up-step__description">
          No new proficiency choices at this level.
        </p>
      </div>
    );
  }

  return (
    <div className="level-up-step">
      <h3 className="level-up-step__title">Choose Proficiencies</h3>
      <p className="level-up-step__description">
        Select the proficiencies granted at this level.
      </p>

      {skillGroups.map((group) => (
        <SkillChoiceGroup
          key={group.sourceId}
          group={group}
          selected={
            draft.proficiencySelectionsBySource[getSelectionKey(group)] ?? []
          }
          onChange={(next) => updateSourceSelections(group, next)}
        />
      ))}

      {weaponGroups.map((group) => (
        <SkillChoiceGroup
          key={group.sourceId}
          group={group}
          selected={
            draft.proficiencySelectionsBySource[getSelectionKey(group)] ?? []
          }
          onChange={(next) => updateSourceSelections(group, next)}
        />
      ))}

      {toolGroups.map((group) => (
        <SkillChoiceGroup
          key={group.sourceId}
          group={group}
          selected={
            draft.proficiencySelectionsBySource[getSelectionKey(group)] ?? []
          }
          onChange={(next) => updateSourceSelections(group, next)}
        />
      ))}

      {langGroups.map((group) => (
        <SkillChoiceGroup
          key={group.sourceId}
          group={group}
          selected={
            draft.proficiencySelectionsBySource[getSelectionKey(group)] ?? []
          }
          onChange={(next) => updateSourceSelections(group, next)}
        />
      ))}
    </div>
  );

  // #endregion
};
