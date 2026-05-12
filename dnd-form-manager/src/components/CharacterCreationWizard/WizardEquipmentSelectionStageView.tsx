import type React from "react";
import "./WizardPickerStage.css";

export interface WizardEquipmentCategoryOption {
  id: string;
  name: string;
}

export interface WizardEquipmentCategorySelectionView {
  selectionKey: string;
  selectedItemId: string;
  options: WizardEquipmentCategoryOption[];
  emptyMessage: string;
  ariaLabel: string;
}

export interface WizardEquipmentBundleEntryView {
  key: string;
  label: string;
  categorySelection?: WizardEquipmentCategorySelectionView;
}

export interface WizardEquipmentChoiceOptionView {
  key: string;
  isSelected: boolean;
  entries: WizardEquipmentBundleEntryView[];
}

export interface WizardEquipmentChoiceGroupView {
  key: string;
  label: string;
  options: WizardEquipmentChoiceOptionView[];
}

export interface WizardEquipmentSelectionStageViewProps {
  classSelected: boolean;
  givenItems: Array<{ key: string; label: string }>;
  choiceGroups: WizardEquipmentChoiceGroupView[];
  resolvedGroupCount: number;
  onSelectOption: (groupIndex: number, optionIndex: number) => void;
  onSelectCategoryItem: (selectionKey: string, itemId: string) => void;
}

export const WizardEquipmentSelectionStageView: React.FC<
  WizardEquipmentSelectionStageViewProps
> = ({
  classSelected,
  givenItems,
  choiceGroups,
  resolvedGroupCount,
  onSelectOption,
  onSelectCategoryItem,
}) => {
  if (!classSelected) {
    return (
      <div className="picker-stage">
        <h2 className="picker-stage-title">Starting Equipment</h2>
        <p className="picker-stage-subtitle">Select a class first.</p>
      </div>
    );
  }

  return (
    <div className="picker-stage">
      <h2 className="picker-stage-title">Starting Equipment</h2>
      <p className="picker-stage-subtitle">
        Review your starting gear and make your equipment choices.
      </p>

      {givenItems.length > 0 && (
        <>
          <div className="picker-section-header">Included Gear</div>
          <ul className="picker-given-list">
            {givenItems.map((item) => (
              <li key={item.key} className="picker-given-item">
                {item.label}
              </li>
            ))}
          </ul>
        </>
      )}

      {choiceGroups.length > 0 && (
        <>
          <div className="picker-section-header">Your Choices</div>
          {choiceGroups.map((group, groupIndex) => (
            <div key={group.key} className="picker-bundle-group">
              <div className="picker-bundle-label">{group.label}</div>
              <div className="picker-bundle-options">
                {group.options.map((option, optionIndex) => (
                  <div
                    key={option.key}
                    className={`picker-bundle-card ${option.isSelected ? "selected" : ""}`}
                    onClick={() => onSelectOption(groupIndex, optionIndex)}
                  >
                    {option.entries.map((entry) => (
                      <div key={entry.key}>
                        <div>{entry.label}</div>
                        {entry.categorySelection && (
                          entry.categorySelection.options.length > 0 ? (
                            <select
                              value={entry.categorySelection.selectedItemId}
                              onClick={(event) => event.stopPropagation()}
                              onChange={(event) =>
                                onSelectCategoryItem(
                                  entry.categorySelection!.selectionKey,
                                  event.target.value,
                                )
                              }
                              aria-label={entry.categorySelection.ariaLabel}
                            >
                              <option value="">Select an item</option>
                              {entry.categorySelection.options.map((categoryOption) => (
                                <option key={categoryOption.id} value={categoryOption.id}>
                                  {categoryOption.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>{entry.categorySelection.emptyMessage}</div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {choiceGroups.length === 0 && (
        <p className="picker-stage-subtitle">
          No equipment choices for this class - everything is pre-selected.
        </p>
      )}

      {choiceGroups.length > 0 && (
        <div className={`picker-counter ${resolvedGroupCount >= choiceGroups.length ? "complete" : ""}`}>
          {resolvedGroupCount} / {choiceGroups.length} choices made
        </div>
      )}
    </div>
  );
};
