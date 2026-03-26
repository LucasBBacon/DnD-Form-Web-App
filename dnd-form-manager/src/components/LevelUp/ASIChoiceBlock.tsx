import { useState } from "react";
import type { LevelChoice } from "../../types/progression";
import type { Ability } from "../../types/common";

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

interface ASIChoiceBlockProps {
  level: number;
  onSave: (choice: Partial<LevelChoice>) => void;
  onConfirm: () => void;
}

export const ASIChoiceBlock: React.FC<ASIChoiceBlockProps> = ({
  level,
  onSave,
  onConfirm,
}) => {
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
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Derive how many points to spend
  const totalPointsSpent = Object.values(asiSelections).reduce(
    (a, b) => a + b,
    0,
  );
  const remainingPoints = 2 - totalPointsSpent;

  const handleIncrement = (stat: Ability) => {
    if (remainingPoints > 0 && asiSelections[stat] < 2) {
      setAsiSelections({ ...asiSelections, [stat]: asiSelections[stat] + 1 });
      setIsConfirmed(false); // Un-confirm if they change their mind
    }
  };

  const handleDecrement = (stat: Ability) => {
    if (asiSelections[stat] > 0) {
      setAsiSelections({ ...asiSelections, [stat]: asiSelections[stat] - 1 });
      setIsConfirmed(false);
    }
  };

  const handleSave = () => {
    if (choiceType === "asi") {
      // Clean out 0s before saving to zustand
      const cleanSelections: Partial<Record<Ability, number>> = {};
      (Object.keys(asiSelections) as Ability[]).forEach((key) => {
        if (asiSelections[key] > 0) cleanSelections[key] = asiSelections[key];
      });
      onSave({ asiChoices: cleanSelections });
    } else {
      onSave({ featId: selectedFeat });
    }

    setIsConfirmed(true);
    onConfirm();
  };

  const isValid =
    (choiceType === "asi" && totalPointsSpent === 2) ||
    (choiceType === "feat" && selectedFeat !== "");

  return (
    <div className="choice-block asi-block">
      <h3>Level {level}: Ability Score Improvements</h3>

      {/* Toggle between ASI and Feat */}
      <div className="toggle-group">
        <button
          onClick={() => {
            setChoiceType("asi");
            setIsConfirmed(false);
          }}
        >
          Increase Stats
        </button>
        <button
          onClick={() => {
            setChoiceType("feat");
            setIsConfirmed(false);
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
                    disabled={asiSelections[stat] === 0 || isConfirmed}
                  >
                    -
                  </button>
                  <span>+{asiSelections[stat]}</span>
                  <button
                    onClick={() => handleIncrement(stat)}
                    disabled={
                      remainingPoints === 0 ||
                      asiSelections[stat] === 2 ||
                      isConfirmed
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
            onChange={(e) => {
              setSelectedFeat(e.target.value);
              setIsConfirmed(false);
            }}
            disabled={isConfirmed}
          >
            <option value="" disabled>
              Select a feat...
            </option>
            <option value="feat_tough">Tough</option>
            <option value="feat_alert">Alert</option>
            {/* TODO: Map from feats.json later */}
          </select>
        </div>
      )}

      <button
        className="confirm-btn"
        onClick={handleSave}
        disabled={!isValid || isConfirmed}
      >
        {isConfirmed ? "Choice Saved" : "Confirm Choice"}
      </button>
    </div>
  );
};
