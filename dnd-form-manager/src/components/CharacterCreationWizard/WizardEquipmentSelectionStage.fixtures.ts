import type { WizardEquipmentSelectionStageViewProps } from "./WizardEquipmentSelectionStageView";

export type WizardEquipmentSelectionScenario = Omit<
  WizardEquipmentSelectionStageViewProps,
  "onSelectOption" | "onSelectCategoryItem"
>;

export const WIZARD_EQUIPMENT_SELECTION_FIXTURES: Record<
  string,
  WizardEquipmentSelectionScenario
> = {
  classNotSelected: {
    classSelected: false,
    givenItems: [],
    choiceGroups: [],
    resolvedGroupCount: 0,
  },
  noChoices: {
    classSelected: true,
    givenItems: [
      { key: "item-clothes", label: "Traveler's Clothes" },
      { key: "item-dagger", label: "Dagger" },
    ],
    choiceGroups: [],
    resolvedGroupCount: 0,
  },
  withChoicesIncomplete: {
    classSelected: true,
    givenItems: [{ key: "item-spellbook", label: "Spellbook" }],
    choiceGroups: [
      {
        key: "group-0",
        label: "Choice 1 - pick 1",
        options: [
          {
            key: "group-0-option-0",
            isSelected: true,
            entries: [
              { key: "entry-0-0-0", label: "Quarterstaff" },
            ],
          },
          {
            key: "group-0-option-1",
            isSelected: false,
            entries: [
              {
                key: "entry-0-1-0",
                label: "Arcane Focus",
                categorySelection: {
                  selectionKey: "0:1:0:itemcat_arcane_focus",
                  selectedItemId: "",
                  options: [
                    { id: "item_arcane_focus_crystal", name: "Crystal" },
                    { id: "item_arcane_focus_orb", name: "Orb" },
                  ],
                  emptyMessage: "No items available in this category.",
                  ariaLabel: "Choose item for Arcane Focus",
                },
              },
            ],
          },
        ],
      },
      {
        key: "group-1",
        label: "Choice 2 - pick 1",
        options: [
          {
            key: "group-1-option-0",
            isSelected: false,
            entries: [{ key: "entry-1-0-0", label: "Scholar's Pack" }],
          },
          {
            key: "group-1-option-1",
            isSelected: true,
            entries: [{ key: "entry-1-1-0", label: "Explorer's Pack" }],
          },
        ],
      },
    ],
    resolvedGroupCount: 1,
  },
  allChoicesComplete: {
    classSelected: true,
    givenItems: [{ key: "item-shield", label: "Shield" }],
    choiceGroups: [
      {
        key: "group-0",
        label: "Choice 1 - pick 1",
        options: [
          {
            key: "group-0-option-0",
            isSelected: true,
            entries: [
              {
                key: "entry-0-0-0",
                label: "Martial Weapon",
                categorySelection: {
                  selectionKey: "0:0:0:itemcat_martial_weapon",
                  selectedItemId: "item_longsword",
                  options: [
                    { id: "item_longsword", name: "Longsword" },
                    { id: "item_warhammer", name: "Warhammer" },
                  ],
                  emptyMessage: "No items available in this category.",
                  ariaLabel: "Choose item for Martial Weapon",
                },
              },
            ],
          },
          {
            key: "group-0-option-1",
            isSelected: false,
            entries: [{ key: "entry-0-1-0", label: "Crossbow, Light" }],
          },
        ],
      },
    ],
    resolvedGroupCount: 1,
  },
};
