import type React from "react";
import "./WizardPickerStage.css";
import { useCharacterStore } from "../../store/useCharacterStore";
import {
  getClassById,
  getItemsByCategory,
  getItemById,
  getItemCategoryById,
} from "../../data/staticDataApi";
import {
  makeStartingEquipmentCategorySelectionKey,
  normalizeEquipmentReference,
} from "../../types/class";
import { WizardEquipmentSelectionStageView } from "./WizardEquipmentSelectionStageView";

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
      <WizardEquipmentSelectionStageView
        classSelected={false}
        givenItems={[]}
        choiceGroups={[]}
        resolvedGroupCount={0}
        onSelectOption={() => {}}
        onSelectCategoryItem={() => {}}
      />
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

  const givenItems = given.map((item, index) => {
    const normalized = normalizeEquipmentReference(item);
    return {
      key: `given-${index}-${normalized.kind}-${normalized.refId}`,
      label: resolveItemLabel(normalized.refId, normalized.quantity),
    };
  });

  const choiceGroups = choices.map((group, groupIndex) => {
    const selectedOptionIndex = startingEquipmentSelections[groupIndex];

    return {
      key: `group-${groupIndex}`,
      label: `Choice ${groupIndex + 1} - pick ${group.choose}`,
      options: group.options.map((option, optionIndex) => ({
        key: `group-${groupIndex}-option-${optionIndex}`,
        isSelected: selectedOptionIndex === optionIndex,
        entries: option.equipmentBundle.map((entry, bundleIndex) => {
          const normalized = normalizeEquipmentReference(entry);

          if (normalized.kind === "item") {
            return {
              key: `entry-${groupIndex}-${optionIndex}-${bundleIndex}`,
              label: resolveItemLabel(normalized.refId, normalized.quantity),
            };
          }

          const category = getItemCategoryById(normalized.refId);
          const categoryItems = getItemsByCategory(normalized.refId);
          const selectionKey = makeStartingEquipmentCategorySelectionKey(
            groupIndex,
            optionIndex,
            bundleIndex,
            normalized.refId,
          );

          return {
            key: `entry-${groupIndex}-${optionIndex}-${bundleIndex}`,
            label:
              normalized.quantity > 1
                ? `${category?.name ?? normalized.refId} x${normalized.quantity}`
                : (category?.name ?? normalized.refId),
            categorySelection: {
              selectionKey,
              selectedItemId:
                startingEquipmentCategorySelections[selectionKey] ?? "",
              options: categoryItems.map((categoryItem) => ({
                id: categoryItem.id,
                name: categoryItem.name,
              })),
              emptyMessage: "No items available in this category.",
              ariaLabel: `Choose item for ${category?.name ?? normalized.refId}`,
            },
          };
        }),
      })),
    };
  });

  return (
    <WizardEquipmentSelectionStageView
      classSelected
      givenItems={givenItems}
      choiceGroups={choiceGroups}
      resolvedGroupCount={resolvedGroupCount}
      onSelectOption={setStartingEquipmentSelection}
      onSelectCategoryItem={setStartingEquipmentCategorySelection}
    />
  );
};
