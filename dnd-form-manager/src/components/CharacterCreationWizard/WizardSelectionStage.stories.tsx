import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { WizardSelectionStageView } from "./WizardSelectionStageView";
import type { SelectionOption } from "../../types/wizardSelection";

const raceOptions: SelectionOption[] = [
  {
    id: "race_elf",
    name: "Elf",
    tagline: "Graceful and keen-sensed",
    description: "Elves are a magical people of otherworldly grace.",
    traits: [
      {
        name: "Darkvision",
        shortDescription: "See in the dark up to 60 feet.",
        fullDescription:
          "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions.",
      },
      {
        name: "Fey Ancestry",
        shortDescription: "Advantage on saves against charm.",
        fullDescription:
          "You have advantage on saving throws against being charmed, and magic cannot put you to sleep.",
      },
    ],
    subOptionLabel: "Subrace",
    subOptions: [
      {
        id: "subrace_high_elf",
        name: "High Elf",
        tagline: "Scholarly and arcane",
        description: "High Elves pursue lore and mastery of magic.",
        traits: [
          {
            name: "Cantrip",
            shortDescription: "Know one wizard cantrip.",
            fullDescription:
              "You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability.",
          },
        ],
      },
      {
        id: "subrace_wood_elf",
        name: "Wood Elf",
        tagline: "Swift and secretive",
        description: "Wood Elves move swiftly through natural terrain.",
        traits: [
          {
            name: "Fleet of Foot",
            shortDescription: "Base walking speed increases.",
            fullDescription:
              "Your base walking speed increases to reflect your natural agility.",
          },
        ],
      },
    ],
  },
  {
    id: "race_dwarf",
    name: "Dwarf",
    tagline: "Resilient and steadfast",
    description: "Dwarves are known for endurance and craftsmanship.",
    traits: [
      {
        name: "Dwarven Resilience",
        shortDescription: "Resistance against poison.",
        fullDescription:
          "You have advantage on saving throws against poison, and resistance against poison damage.",
      },
    ],
  },
];

const meta: Meta<typeof WizardSelectionStageView> = {
  title: "Wizard/WizardSelectionStage",
  component: WizardSelectionStageView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof WizardSelectionStageView>;

export const RaceChooser: Story = {
  args: {
    title: "Race",
    options: raceOptions,
    currentSelectionId: null,
    currentSubSelectionId: null,
    expandedBaseId: null,
    expandedSubId: null,
    expandedTraitIndex: null,
    onExpandedBaseIdChange: () => {},
    onExpandedSubIdChange: () => {},
    onExpandedTraitIndexChange: () => {},
    onSelect: () => {},
  },
};

export const WithCurrentChoice: Story = {
  args: {
    title: "Race",
    options: raceOptions,
    currentSelectionId: "race_elf",
    currentSubSelectionId: "subrace_high_elf",
    expandedBaseId: "race_elf",
    expandedSubId: "subrace_high_elf",
    expandedTraitIndex: 0,
    onExpandedBaseIdChange: () => {},
    onExpandedSubIdChange: () => {},
    onExpandedTraitIndexChange: () => {},
    onSelect: () => {},
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [expandedBaseId, setExpandedBaseId] = useState<string | null>(null);
    const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
    const [expandedTraitIndex, setExpandedTraitIndex] = useState<number | null>(
      null,
    );

    return (
      <WizardSelectionStageView
        {...args}
        expandedBaseId={expandedBaseId}
        expandedSubId={expandedSubId}
        expandedTraitIndex={expandedTraitIndex}
        onExpandedBaseIdChange={setExpandedBaseId}
        onExpandedSubIdChange={setExpandedSubId}
        onExpandedTraitIndexChange={setExpandedTraitIndex}
      />
    );
  },
  args: {
    title: "Race",
    options: raceOptions,
    currentSelectionId: null,
    currentSubSelectionId: null,
    onSelect: () => {},
  },
};
