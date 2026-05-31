import React, { useMemo } from "react";
import { getAllSpells } from "../../../data/staticDataApi";
import { useCharacterStore } from "../../../store/useCharacterStore";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";

// #region --- Types ---

interface SpellChoiceStepProps {
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

// #region --- Spell Selector Component ---

/**
  * Step for choosing which spells to learn at a level that grants new spells.
 * @param param0 Props for the spell selector
 * @returns JSX element for the spell selector
 */
function SpellSelector({
  label,
  needed,
  selected,
  pool,
  onChange,
}: {
  label: string;
  needed: number;
  selected: string[];
  pool: { id: string; name: string; level: number }[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < needed) {
      onChange([...selected, id]);
    }
  };

  // #region --- Render ---

  return (
    <div style={{ marginBottom: "1rem" }}>
      <p className="level-up-step__section-label">
        {label} — choose {needed} (selected {selected.length}/{needed})
      </p>
      <ul
        className="level-up-step__option-list"
        style={{ maxHeight: 240, overflowY: "auto" }}
      >
        {pool.map((spell) => {
          const isChecked = selected.includes(spell.id);
          const isDisabled = !isChecked && selected.length >= needed;
          return (
            <li key={spell.id}>
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
                  onChange={() => toggle(spell.id)}
                />
                <span className="level-up-step__option-label">
                  {spell.name}
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

/**
  * Step for choosing new spells to learn at a level-up. Shows separate selectors for cantrips and leveled spells if both are granted.
 * @param param0 Props for the spell choice step
 * @returns JSX element for the spell choice step
 */
export const SpellChoiceStep: React.FC<SpellChoiceStepProps> = ({
  draft,
  onUpdateDraft,
  plan,
  classData,
}) => {
  const { newSpellsToLearn, newCantripsToLearn } = plan.requirements;
  const { spellsKnown } = useCharacterStore();

  const allSpells = useMemo(() => getAllSpells(), []);

  const classSpells = useMemo(() => {
    if (!classData) return allSpells;
    return allSpells.filter((s) => s.classes.includes(classData.id));
  }, [allSpells, classData]);

  const knownSpellIds = useMemo(() => new Set(spellsKnown), [spellsKnown]);

  const sortSpells = (
    a: { level: number; name: string },
    b: { level: number; name: string },
  ) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  };

  // #region Fetch Spells and Cantrips

  const cantripPool = useMemo(
    () =>
      classSpells
        .filter((s) => s.level === 0 && !knownSpellIds.has(s.id))
        .sort(sortSpells),
    [classSpells, knownSpellIds],
  );

  const spellPool = useMemo(
    () =>
      classSpells
        .filter((s) => s.level >= 1 && !knownSpellIds.has(s.id))
        .sort(sortSpells),
    [classSpells, knownSpellIds],
  );

  // #endregion

  // #region --- Render ---

  return (
    <div className="level-up-step">
      <h3 className="level-up-step__title">Learn Spells</h3>
      <p className="level-up-step__description">
        Choose the spells you learn at this level.
      </p>

      {newCantripsToLearn > 0 && (
        <SpellSelector
          label="Cantrips"
          needed={newCantripsToLearn}
          selected={draft.cantripsLearned}
          pool={cantripPool}
          onChange={(next) => onUpdateDraft({ cantripsLearned: next })}
        />
      )}

      {newSpellsToLearn > 0 && (
        <SpellSelector
          label="Spells"
          needed={newSpellsToLearn}
          selected={draft.spellsLearned}
          pool={spellPool}
          onChange={(next) => onUpdateDraft({ spellsLearned: next })}
        />
      )}

      {newCantripsToLearn > 0 && cantripPool.length === 0 && (
        <p className="level-up-step__description">
          No eligible new cantrips are available.
        </p>
      )}
      {newSpellsToLearn > 0 && spellPool.length === 0 && (
        <p className="level-up-step__description">
          No eligible new spells are available.
        </p>
      )}
    </div>
  );

  // #endregion
};
