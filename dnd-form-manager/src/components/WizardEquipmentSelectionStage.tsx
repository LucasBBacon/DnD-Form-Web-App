import type React from "react";
import "./WizardPickerStage.css";
import { useCharacterStore } from "../store/useCharacterStore";
import {
  getClassById,
  getItemsByCategory,
  getItemById,
  getItemCategoryById,
} from "../data/staticDataApi";
import {
  makeStartingEquipmentCategorySelectionKey,
  normalizeEquipmentReference,
  type EquipmentReference,
} from "../types/class";

/** Resolves a display name for an item ID, falling back gracefully when the
 *  item data does not exist yet. */
function resolveItemLabel(itemId: string, quantity: number): string {
  const itemData = getItemById(itemId);
  if (itemData) {
    return quantity > 1 ? `${itemData.name} ×${quantity}` : itemData.name;
  }

  const categoryData = getItemCategoryById(itemId);
  if (categoryData) {
    return quantity > 1
      ? `${categoryData.name} (pick ${quantity})`
      : `${categoryData.name} (pick 1)`;
  }

  return `Missing equipment reference: ${itemId}`;
}

export const WizardEquipmentSelectionStage: React.FC = () => {
  const classId = useCharacterStore((s) => s.classId);
  const startingEquipmentSelections = useCharacterStore(
    (s) => s.startingEquipmentSelections,
  );
  const startingEquipmentCategorySelections = useCharacterStore(
    (s) => s.startingEquipmentCategorySelections,
  );
  const setStartingEquipmentSelection = useCharacterStore(
    (s) => s.setStartingEquipmentSelection,
  );
  const setStartingEquipmentCategorySelection = useCharacterStore(
    (s) => s.setStartingEquipmentCategorySelection,
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

  const isGroupResolved = (
    group: (typeof choices)[number],
    groupIndex: number,
  ): boolean => {
    const selectedOptionIndex = startingEquipmentSelections[groupIndex];
    if (selectedOptionIndex === undefined) {
      return false;
    }

    const selectedBundle =
      group.options[selectedOptionIndex]?.equipmentBundle ?? [];

    return selectedBundle.every((entry, bundleIndex) => {
      const normalized = normalizeEquipmentReference(entry);
      if (normalized.kind !== "category") {
        return true;
      }

      const selectionKey = makeStartingEquipmentCategorySelectionKey(
        groupIndex,
        selectedOptionIndex,
        bundleIndex,
        normalized.refId,
      );
      return !!startingEquipmentCategorySelections[selectionKey];
    });
  };

  const resolvedGroupCount = choices.filter((group, groupIndex) =>
    isGroupResolved(group, groupIndex),
  ).length;
  const allGroupsResolved = resolvedGroupCount === choices.length;

  const renderBundleEntry = (
    entry: EquipmentReference,
    groupIndex: number,
    optionIndex: number,
    bundleIndex: number,
  ) => {
    const normalized = normalizeEquipmentReference(entry);

    if (normalized.kind === "item") {
      return (
        <div key={`bundle-${bundleIndex}`}>
          {resolveItemLabel(normalized.refId, normalized.quantity)}
        </div>
      );
    }

    const category = getItemCategoryById(normalized.refId);
    const categoryItems = getItemsByCategory(normalized.refId);
    const selectionKey = makeStartingEquipmentCategorySelectionKey(
      groupIndex,
      optionIndex,
      bundleIndex,
      normalized.refId,
    );
    const selectedItemId = startingEquipmentCategorySelections[selectionKey] ?? "";

    return (
      <div key={`bundle-${bundleIndex}`}>
        <div>
          {normalized.quantity > 1
            ? `${category?.name ?? normalized.refId} x${normalized.quantity}`
            : (category?.name ?? normalized.refId)}
        </div>
        {categoryItems.length > 0 ? (
          <select
            value={selectedItemId}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              setStartingEquipmentCategorySelection(selectionKey, event.target.value)
            }
            aria-label={`Choose item for ${category?.name ?? normalized.refId}`}
          >
            <option value="">Select an item</option>
            {categoryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : (
          <div>No items available in this category.</div>
        )}
      </div>
    );
  };

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
              <li
                key={`${normalizeEquipmentReference(item).kind}-${normalizeEquipmentReference(item).refId}`}
                className="picker-given-item"
              >
                {resolveItemLabel(
                  normalizeEquipmentReference(item).refId,
                  normalizeEquipmentReference(item).quantity,
                )}
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
                        {opt.equipmentBundle.map((entry, bundleIndex) =>
                          renderBundleEntry(entry, groupIndex, optIndex, bundleIndex),
                        )}
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
          {resolvedGroupCount} / {choices.length} choices made
        </div>
      )}
    </div>
  );
};
