import { useState } from "react";
import type { LevelChoice } from "../../types/progression";
import type { Ability } from "../../types/common";

interface ASIChoiceBlockProps {
  level: number;
  onSave: (choice: Partial<LevelChoice>) => void;
}

export const ASIChoiceBlock: React.FC<ASIChoiceBlockProps> = ({
  level,
  onSave,
}) => {
  const [choiceType, setChoiceType] = useState<"asi" | "feat">("asi");
  const [asiSelections, setAsiSelections] = useState<
    Partial<Record<Ability, number>>
  >({});
  const [selectedFeat, setSelectedFeat] = useState<string>("");

  // Simplified handler
  const handleSave = () => {
    if (choiceType === "asi") {
      onSave({ asiChoices: asiSelections });
    } else {
      onSave({ featId: selectedFeat });
    }
  };

  return (
    <div className="choice-block asi-block">
      <h3>Level {level}: Ability Score Improvements</h3>

      {/* Toggle between ASI and Feat */}
      <div className="toggle-group">
        <button onClick={() => setChoiceType("asi")}>Increase Stats</button>
        <button onClick={() => setChoiceType("feat")}>Choose a Feat</button>
      </div>

      {choiceType === "asi" ? (
        <div className="asi-picker">
          <p>Select +2 to one stat, or +1 to two stats.</p>
          {/* TODO: UI for incrementing ability score */}
        </div>
      ) : (
        <div className="feat-picker">
          <p>Select a Feat from the list.</p>
          {/* Dropdown mapped from feats file */}
        </div>
      )}

      <button onClick={handleSave}>Confirm ASI Choice</button>
    </div>
  );
};
