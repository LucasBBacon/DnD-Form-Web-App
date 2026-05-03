import type React from "react";
import "./WizardPickerStage.css";
import { useCharacterStore } from "../store/useCharacterStore";
import { getClassById, getItemById } from "../data/staticDataApi";

/** Resolves a display name for an item ID, falling back gracefully when the
 *  item data does not exist yet. */
function resolveItemLabel(itemId: string, quantity: number): string {
  const itemData = getItemById(itemId);
  if (!itemData) {
    return `Missing equipment reference: ${itemId}`;
  }
  return quantity > 1 ? `${itemData.name} ×${quantity}` : itemData.name;
}

/** Formats a bundle of equipment items into a single readable string. */
function formatBundle(
  bundle: Array<{ itemId: string; quantity: number }>,
): string {
  return bundle
    .map((item) => resolveItemLabel(item.itemId, item.quantity))
    .join(", ");
}

export const WizardEquipmentSelectionStage: React.FC = () => {
  const classId = useCharacterStore((s) => s.classId);
  const startingEquipmentSelections = useCharacterStore(
    (s) => s.startingEquipmentSelections,
  );
  const setStartingEquipmentSelection = useCharacterStore(
    (s) => s.setStartingEquipmentSelection,
  );

  const classData = getClassById(classId);

  if (!classData) {
    return (
      <div className="picker-stage">
        <h2 className="picker-stage-title">Starting Equipment</h2>
        <p className="picker-stage-subtitle">Select a class first.</p>
      </div>
    );
  }

  const { given, choices } = classData.startingEquipment;
  const allGroupsResolved = choices.every(
    (_, i) => startingEquipmentSelections[i] !== undefined,
  );

  return (
    <div className="picker-stage">
      <h2 className="picker-stage-title">Starting Equipment</h2>
      <p className="picker-stage-subtitle">
        Review your starting gear and make your equipment choices.
      </p>

      {/* Given items */}
      {given.length > 0 && (
        <>
          <div className="picker-section-header">Included Gear</div>
          <ul className="picker-given-list">
            {given.map((item) => (
              <li key={item.itemId} className="picker-given-item">
                {resolveItemLabel(item.itemId, item.quantity)}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Choice groups */}
      {choices.length > 0 && (
        <>
          <div className="picker-section-header">Your Choices</div>
          {choices.map((group, groupIndex) => {
            const selectedOptionIndex =
              startingEquipmentSelections[groupIndex];

            return (
              <div key={groupIndex} className="picker-bundle-group">
                <div className="picker-bundle-label">
                  Choice {groupIndex + 1} — pick {group.choose}
                </div>
                <div className="picker-bundle-options">
                  {group.options.map((opt, optIndex) => {
                    const isSelected = selectedOptionIndex === optIndex;
                    return (
                      <div
                        key={optIndex}
                        className={`picker-bundle-card ${isSelected ? "selected" : ""}`}
                        onClick={() =>
                          setStartingEquipmentSelection(groupIndex, optIndex)
                        }
                      >
                        {formatBundle(opt.equipmentBundle)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {choices.length === 0 && (
        <p className="picker-stage-subtitle">
          No equipment choices for this class — everything is pre-selected.
        </p>
      )}

      {/* Completion status */}
      {choices.length > 0 && (
        <div
          className={`picker-counter ${allGroupsResolved ? "complete" : ""}`}
        >
          {Object.keys(startingEquipmentSelections).length} / {choices.length}{" "}
          choices made
        </div>
      )}
    </div>
  );
};
