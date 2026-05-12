import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { WizardEquipmentSelectionStageView } from "./WizardEquipmentSelectionStageView";
import { WIZARD_EQUIPMENT_SELECTION_FIXTURES } from "./WizardEquipmentSelectionStage.fixtures";

const meta: Meta<typeof WizardEquipmentSelectionStageView> = {
  title: "Wizard/WizardEquipmentSelectionStage",
  component: WizardEquipmentSelectionStageView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof WizardEquipmentSelectionStageView>;

const baseCallbacks = {
  onSelectOption: () => {},
  onSelectCategoryItem: () => {},
};

export const ClassNotSelected: Story = {
  args: {
    ...WIZARD_EQUIPMENT_SELECTION_FIXTURES.classNotSelected,
    ...baseCallbacks,
  },
};

export const NoChoices: Story = {
  args: {
    ...WIZARD_EQUIPMENT_SELECTION_FIXTURES.noChoices,
    ...baseCallbacks,
  },
};

export const WithChoicesIncomplete: Story = {
  args: {
    ...WIZARD_EQUIPMENT_SELECTION_FIXTURES.withChoicesIncomplete,
    ...baseCallbacks,
  },
};

export const AllChoicesComplete: Story = {
  args: {
    ...WIZARD_EQUIPMENT_SELECTION_FIXTURES.allChoicesComplete,
    ...baseCallbacks,
  },
};

export const InteractiveOptions: Story = {
  render: () => {
    const fixture = WIZARD_EQUIPMENT_SELECTION_FIXTURES.withChoicesIncomplete;
    const [choiceGroups, setChoiceGroups] = useState(fixture.choiceGroups);

    return (
      <WizardEquipmentSelectionStageView
        {...fixture}
        choiceGroups={choiceGroups}
        onSelectOption={(groupIndex, optionIndex) => {
          setChoiceGroups((current) =>
            current.map((group, gIdx) => {
              if (gIdx !== groupIndex) return group;
              return {
                ...group,
                options: group.options.map((option, oIdx) => ({
                  ...option,
                  isSelected: oIdx === optionIndex,
                })),
              };
            }),
          );
        }}
        onSelectCategoryItem={(selectionKey, itemId) => {
          setChoiceGroups((current) =>
            current.map((group) => ({
              ...group,
              options: group.options.map((option) => ({
                ...option,
                entries: option.entries.map((entry) => {
                  if (!entry.categorySelection) return entry;
                  if (entry.categorySelection.selectionKey !== selectionKey) {
                    return entry;
                  }
                  return {
                    ...entry,
                    categorySelection: {
                      ...entry.categorySelection,
                      selectedItemId: itemId,
                    },
                  };
                }),
              })),
            })),
          );
        }}
      />
    );
  },
};
