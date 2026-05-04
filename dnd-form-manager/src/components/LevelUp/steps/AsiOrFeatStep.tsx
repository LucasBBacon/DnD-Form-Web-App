import React from "react";
import { getAllFeats } from "../../../data/staticDataApi";
import type { Ability } from "../../../types/common";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import { isFeatEligible } from "../../../utils/featUtils";
import { useCharacterStats } from "../../../hooks/useCharacterStats";
import { useCharacterStore } from "../../../store/useCharacterStore";

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_LABELS: Record<Ability, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

interface AsiOrFeatStepProps {
  draft: LevelUpDraft;
  onUpdateDraft: (updates: Partial<LevelUpDraft>) => void;
  plan: LevelUpPlannerResult;
  classData: ClassData | null;
  subclassData: SubclassData | null;
}

export const AsiOrFeatStep: React.FC<AsiOrFeatStepProps> = ({
  draft,
  onUpdateDraft,
}) => {
  const { abilities } = useCharacterStats();
  const { level, raceId, subraceId, classId, subclassId, choicesByLevel, acquiredFeats } =
    useCharacterStore();

  const totalScores = abilities.scores;

  const isAsiMode = !draft.featId;
  const usedPoints = Object.values(draft.asiChoices).reduce((s, v) => s + (v ?? 0), 0);
  const remainingPoints = 2 - usedPoints;

  const handleSetAsiMode = () => {
    onUpdateDraft({ featId: null });
  };

  const handleSetFeatMode = () => {
    onUpdateDraft({ asiChoices: {} });
  };

  const handleAsiChange = (ability: Ability, delta: number) => {
    const current = draft.asiChoices[ability] ?? 0;
    const newVal = current + delta;
    if (newVal < 0) return;
    if (delta > 0 && remainingPoints <= 0) return;
    if (totalScores[ability] + newVal > 20) return;
    onUpdateDraft({ asiChoices: { ...draft.asiChoices, [ability]: newVal } });
  };

  const eligibleFeats = getAllFeats().filter((feat) =>
    isFeatEligible(feat, {
      level,
      raceId,
      subraceId,
      classId,
      subclassId,
      totalScores,
      choicesByLevel,
      acquiredFeats,
    }),
  );

  return (
    <div className="level-up-step">
      <h3 className="level-up-step__title">Ability Score Improvement or Feat</h3>
      <p className="level-up-step__description">
        Choose to improve two ability scores by 1 (or one by 2), or take a feat.
      </p>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
        <label className={`level-up-step__option ${isAsiMode ? "level-up-step__option--selected" : ""}`}>
          <input
            type="radio"
            name="asi-or-feat"
            checked={isAsiMode}
            onChange={handleSetAsiMode}
          />
          <span className="level-up-step__option-label">Ability Score Improvement</span>
        </label>
        <label className={`level-up-step__option ${!isAsiMode ? "level-up-step__option--selected" : ""}`}>
          <input
            type="radio"
            name="asi-or-feat"
            checked={!isAsiMode}
            onChange={handleSetFeatMode}
          />
          <span className="level-up-step__option-label">Feat</span>
        </label>
      </div>

      {isAsiMode ? (
        <>
          <p className="asi-step__points-remaining">
            Points remaining: <strong>{remainingPoints}</strong> / 2
          </p>
          <div className="asi-step__ability-grid">
            {ABILITIES.map((ability) => {
              const base = totalScores[ability];
              const allocated = draft.asiChoices[ability] ?? 0;
              const atMax = base + allocated >= 20;
              return (
                <div key={ability} className="asi-step__ability-cell">
                  <span className="asi-step__ability-name">{ABILITY_LABELS[ability]}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #888)" }}>
                    {base}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAsiChange(ability, -1)}
                    disabled={allocated === 0}
                    style={{
                      padding: "0 6px",
                      background: "none",
                      border: "1px solid #555",
                      borderRadius: 3,
                      cursor: "pointer",
                      color: "#ccc",
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 16, textAlign: "center", fontWeight: 700 }}>
                    +{allocated}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAsiChange(ability, 1)}
                    disabled={remainingPoints === 0 || atMax}
                    style={{
                      padding: "0 6px",
                      background: "none",
                      border: "1px solid #555",
                      borderRadius: 3,
                      cursor: "pointer",
                      color: "#ccc",
                    }}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="level-up-step__description">
            {eligibleFeats.length === 0
              ? "No eligible feats found for your current character."
              : "Choose a feat:"}
          </p>
          <ul className="level-up-step__option-list">
            {eligibleFeats.map((feat) => (
              <li key={feat.id}>
                <label
                  className={[
                    "level-up-step__option",
                    draft.featId === feat.id ? "level-up-step__option--selected" : "",
                  ]
                    .join(" ")
                    .trim()}
                >
                  <input
                    type="radio"
                    name="feat-pick"
                    checked={draft.featId === feat.id}
                    onChange={() => onUpdateDraft({ featId: feat.id })}
                  />
                  <span>
                    <span className="level-up-step__option-label">{feat.name}</span>
                    <br />
                    <span className="level-up-step__option-hint">
                      {feat.lore.shortDescription}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
