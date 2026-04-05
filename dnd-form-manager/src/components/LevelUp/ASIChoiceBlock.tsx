import { useEffect, useMemo, useState } from "react";
import { getAllFeats } from "../../data/staticDataApi";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { LevelChoice } from "../../types/progression";
import type { Ability } from "../../types/common";
import { isFeatEligible } from "../../utils/featUtils";
import { useCharacterStats } from "../../hooks/useCharacterStats";

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

interface ASIChoiceBlockProps {
  level: number;
  onChange: (draft: Partial<LevelChoice>, isValid: boolean) => void;
}

export const ASIChoiceBlock: React.FC<ASIChoiceBlockProps> = ({
  level,
  onChange,
}) => {
  const state = useCharacterStore();
  const { totalScores } = useCharacterStats();
  const [choiceType, setChoiceType] = useState<"asi" | "feat">("asi");
  const [asiSelections, setAsiSelections] = useState<Record<Ability, number>>({
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  });
  const [selectedFeat, setSelectedFeat] = useState<string>("");

  // Derive how many points to spend
  const totalPointsSpent = Object.values(asiSelections).reduce(
    (a, b) => a + b,
    0,
  );
  const remainingPoints = 2 - totalPointsSpent;

  const handleIncrement = (stat: Ability) => {
    if (remainingPoints > 0 && asiSelections[stat] < 2) {
      setAsiSelections({ ...asiSelections, [stat]: asiSelections[stat] + 1 });
    }
  };

  const handleDecrement = (stat: Ability) => {
    if (asiSelections[stat] > 0) {
      setAsiSelections({ ...asiSelections, [stat]: asiSelections[stat] - 1 });
    }
  };

  const isValid =
    (choiceType === "asi" && totalPointsSpent === 2) ||
    (choiceType === "feat" && selectedFeat !== "");

  const availableFeats = useMemo(
    () =>
      getAllFeats().filter(
        (feat) =>
          feat.category === "general" &&
          isFeatEligible(feat, {
            level,
            raceId: state.raceId,
            subraceId: state.subraceId,
            classId: state.classId,
            subclassId: state.subclassId,
            totalScores,
            choicesByLevel: state.choicesByLevel,
          }),
      ),
    [
      level,
      state.classId,
      state.choicesByLevel,
      state.raceId,
      state.subclassId,
      state.subraceId,
      totalScores,
    ],
  );

  useEffect(() => {
    const selectedFeatStillAvailable = availableFeats.some(
      (feat) => feat.id === selectedFeat,
    );

    if (!selectedFeatStillAvailable) {
      setSelectedFeat("");
    }
  }, [availableFeats, selectedFeat]);

  useEffect(() => {
    if (choiceType === "asi") {
      const cleanSelections: Partial<Record<Ability, number>> = {};
      (Object.keys(asiSelections) as Ability[]).forEach((key) => {
        if (asiSelections[key] > 0) {
          cleanSelections[key] = asiSelections[key];
        }
      });

      onChange({ asiChoices: cleanSelections, featId: undefined }, isValid);
      return;
    }

    onChange({ featId: selectedFeat, asiChoices: undefined }, isValid);
  }, [asiSelections, choiceType, isValid, onChange, selectedFeat]);

  return (
    <div className="choice-block asi-block">
      <h3>Level {level}: Ability Score Improvements</h3>

      {/* Toggle between ASI and Feat */}
      <div className="toggle-group">
        <button
          onClick={() => {
            setChoiceType("asi");
          }}
        >
          Increase Stats
        </button>
        <button
          onClick={() => {
            setChoiceType("feat");
          }}
        >
          Choose a Feat
        </button>
      </div>

      {choiceType === "asi" ? (
        <div className="asi-picker">
          <p>Select +2 to one stat, or +1 to two stats.</p>
          <div className="asi-grid">
            {ABILITIES.map((stat) => (
              <div key={stat} className="asi-row">
                <span className="stat-label">{stat.toUpperCase()}</span>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleDecrement(stat)}
                    disabled={asiSelections[stat] === 0}
                  >
                    -
                  </button>
                  <span>+{asiSelections[stat]}</span>
                  <button
                    onClick={() => handleIncrement(stat)}
                    disabled={
                      remainingPoints === 0 ||
                      asiSelections[stat] === 2
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="feat-picker">
          <p>Select a Feat from the list.</p>
          <select
            value={selectedFeat}
            disabled={availableFeats.length === 0}
            onChange={(e) => {
              setSelectedFeat(e.target.value);
            }}
          >
            <option value="" disabled>
              Select a feat...
            </option>
            {availableFeats.map((feat) => (
              <option key={feat.id} value={feat.id}>
                {feat.name}
              </option>
            ))}
          </select>
          {availableFeats.length === 0 && (
            <p>No eligible feats are currently available.</p>
          )}
        </div>
      )}
    </div>
  );
};
