import React from "react";
import "../LevelUpModal.css";
import "./ProficiencyChoiceStep.css";
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
import { BookOpen, Check, CheckCircle2, Lock } from "lucide-react";

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

function ProficiencyChoiceGroup({
  group,
  selected,
  onChange,
  pool,
}: {
  group: PendingProficiencyChoice;
  selected: string[];
  onChange: (next: string[]) => void;
  pool: string[];
}) {
  const isMaxReached = selected.length >= group.count;

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val));
    } else if (!isMaxReached) {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="proficiency-choice-group">
      <div className="choice-group-header">
        <div className="group-title-area">
          {/* TODO: Map group.sourceId to a readable name */}
          <span className="group-source-label">Source: {group.sourceName}</span>
          <span className="group-instruction">Choose {group.count}</span>
        </div>
        <div className={`choice-counter ${isMaxReached ? "is-complete" : ""}`}>
          {selected.length} / {group.count}
          {isMaxReached && <CheckCircle2 size={16} className="complete-icon" />}
        </div>
      </div>

      <div className="choice-options-grid">
        {pool.map((option) => {
          const isSelected = selected.includes(option);
          const isLockedOut = isMaxReached && !isSelected;

          return (
            <button
              key={option}
              className={`choice-card ${isSelected ? "is-selected" : ""} ${isLockedOut ? "is-locked-out" : ""}`}
              onClick={() => toggle(option)}
              disabled={isLockedOut}
            >
              <div
                className={`wax-seal-indicator ${isSelected ? "is-filled" : "is-empty"}`}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>
              <span className="choice-name">{option}</span>
              {isLockedOut && <Lock size={12} className="lock-icon" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// #endregion

export const ProficiencyChoiceStep: React.FC<ProficiencyChoiceStepProps> = ({
  draft,
  onUpdateDraft,
  plan,
}) => {
  // #region Pending Choices

  const { pendingProficiencyChoices } = plan;

  // if no choices are required for this level up show a clean, empty state
  if (!pendingProficiencyChoices || pendingProficiencyChoices.length === 0) {
    return (
      <div className="step-container empty-state-container">
        <BookOpen size={32} className="empty-state-icon" />
        <h3 className="empty-state-title">No New Proficiencies</h3>
        <p className="empty-state-text">
          Your existing training carries you forward. No new skills or tools are
          learned at this level.
        </p>
      </div>
    );
  }

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

  const renderCategorySection = (
    title: string,
    groups: PendingProficiencyChoice[],
  ) => {
    if (groups.length === 0) return null;

    return (
      <div className="proficiency-category-section">
        <h4 className="category-header">{title}</h4>
        {groups.map((group) => {
          const selectionKey = getSelectionKey(group);
          const selected = draft.proficiencySelectionsBySource[selectionKey];
          const pool = toSelectionPool(group);

          return (
            <ProficiencyChoiceGroup
              key={selectionKey}
              group={group}
              selected={selected}
              onChange={(next) => updateSourceSelections(group, next)}
              pool={pool}
            />
          );
        })}
      </div>
    );
  };

  // #region --- Render ---

  return (
    <div className="step-container proficiency-choice-step">
      <div className="step-intro">
        <h3 className="step-title">Expand Your Expertise</h3>
        <p className="step-description">
          Select new skills, tools, or languages granted by your continued
          training.
        </p>
      </div>

      <div className="proficiency-ledgers custom-scrollbar">
        {renderCategorySection("Skill Proficiencies", skillGroups)}
        {renderCategorySection("Martial Training (Weapons)", weaponGroups)}
        {renderCategorySection("Artisan & Practical Tools", toolGroups)}
        {renderCategorySection("Languages", langGroups)}
      </div>
    </div>
  );

  // #endregion
};
