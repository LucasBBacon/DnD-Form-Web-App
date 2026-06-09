import React, { useMemo } from "react";
import "../LevelUpModal.css";
import "./SpellChoiceStep.css";
import { getAllSpells } from "../../../data/staticDataApi";
import { useCharacterStore } from "../../../store/useCharacterStore";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import { BookOpen, Check, CheckCircle2, Lock } from "lucide-react";

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

const formatSpellLevel = (level: number) => {
  if (level === 0) return "Cantrip";
  if (level === 1) return "1st Level";
  if (level === 2) return "2nd Level";
  if (level === 3) return "3rd Level";
  return `${level}th Level`;
};

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
  const isMaxReached = selected.length >= needed;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < needed) {
      onChange([...selected, id]);
    }
  };

  const groupedSpells = useMemo(() => {
    return pool.reduce(
      (acc, spell) => {
        if (!acc[spell.level]) acc[spell.level] = [];
        acc[spell.level].push(spell);
        return acc;
      },
      {} as Record<number, typeof pool>,
    );
  }, [pool]);

  const sortedLevels = Object.keys(groupedSpells)
    .map(Number)
    .sort((a, b) => a - b);

  // #region --- Render ---

  return (
    <div className="proficiency-choice-group">
      <div className="choice-group-header">
        <div className="group-title-area">
          <span className="group-instruction">{label}</span>
          <span className="group-source-label">Select up to {needed}</span>
        </div>
        <div className={`choice-counter ${isMaxReached ? "is-complete" : ""}`}>
          {selected.length} / {needed}
          {isMaxReached && <CheckCircle2 size={16} className="complete-icon" />}
        </div>
      </div>

      <div className="spell-groups-container">
        {sortedLevels.map((level) => (
          <div key={level} className="spell-level-section">
            {sortedLevels.length > 1 && (
              <h5 className="spell-level-divider">{formatSpellLevel(level)}</h5>
            )}

            <div className="choice-options-grid">
              {groupedSpells[level].map((spell) => {
                const isSelected = selected.includes(spell.id);
                const isLockedOut = isMaxReached && !isSelected;

                return (
                  <button
                    key={spell.id}
                    className={`choice-card ${isSelected ? "is-selected" : ""} ${isLockedOut ? "is-locked-out" : ""}`}
                    onClick={() => toggle(spell.id)}
                    disabled={isLockedOut}
                  >
                    <div
                      className={`wax-seal-indicator ${isSelected ? "is-filled" : "is-empty"}`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="spell-card-info">
                      <span className="choice-name">{spell.name}</span>
                    </div>
                    {isLockedOut && <Lock size={12} className="lock-icon" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
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

  const totalToLearn = (newSpellsToLearn || 0) + (newCantripsToLearn || 0);

  // #endregion

  // #region --- Render ---

  if (totalToLearn === 0) {
    return (
      <div className="step-container empty-state-container">
        <BookOpen size={32} />
        <h3 className="empty-state-title">No New Incantations</h3>
        <p className="empty-state-text">
          Your spellbook remains unchanged at this level. You do not learn any
          new cantrips or leveled spells at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="step-container spell-choice-step">
      <div className="step-intro">
        <h3 className="step-title">Arcane & Divine Secrets</h3>
        <p className="step-description">
          Your understanding of the weave deepens. Select the new incantations
          you wish to commit to memory.
        </p>
      </div>

      <div className="proficiency-ledgers custom-scrollbar">
        {/* RENDER CANTRIPS */}
        {newCantripsToLearn > 0 && (
          <SpellSelector
            label="New Cantrips"
            needed={newCantripsToLearn}
            selected={draft.cantripsLearned || []}
            pool={cantripPool}
            onChange={(next) => onUpdateDraft({ cantripsLearned: next })}
          />
        )}

        {/* RENDER LEVELED SPELLS */}
        {newSpellsToLearn > 0 && (
          <SpellSelector
            label="New Leveled Spells"
            needed={newSpellsToLearn}
            selected={draft.spellsLearned || []}
            pool={spellPool}
            onChange={(next) => onUpdateDraft({ spellsLearned: next })}
          />
        )}
      </div>
    </div>
  );

  // #endregion
};
