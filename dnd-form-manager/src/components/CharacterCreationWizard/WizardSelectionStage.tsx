import type React from "react";
import { useState } from "react";
import type { SelectionOption } from "../../types/wizardSelection";
import { WizardSelectionStageView } from "./WizardSelectionStageView";

export interface WizardSelectionStageProps {
  title: string;
  options: SelectionOption[];
  currentSelectionId: string | null;
  currentSubSelectionId: string | null;
  onSelect: (baseId: string, subId: string | null) => void;
}

export const WizardSelectionStage: React.FC<WizardSelectionStageProps> = ({
  title,
  options,
  currentSelectionId,
  currentSubSelectionId,
  onSelect,
}) => {
  const [expandedBaseId, setExpandedBaseId] = useState<string | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [expandedTraitIndex, setExpandedTraitIndex] = useState<number | null>(
    null,
  );

  return (
    <WizardSelectionStageView
      title={title}
      options={options}
      currentSelectionId={currentSelectionId}
      currentSubSelectionId={currentSubSelectionId}
      expandedBaseId={expandedBaseId}
      expandedSubId={expandedSubId}
      expandedTraitIndex={expandedTraitIndex}
      onExpandedBaseIdChange={setExpandedBaseId}
      onExpandedSubIdChange={setExpandedSubId}
      onExpandedTraitIndexChange={setExpandedTraitIndex}
      onSelect={onSelect}
    />
  );
};
