import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkillPickerSection } from "./SkillPickerSection";
import type { SkillProficiencyRequirement } from "../../../types/creationRequirement";

const meta = {
  title: "CharacterCreationWizard/SkillPickerSection",
  component: SkillPickerSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SkillPickerSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRequirement: SkillProficiencyRequirement = {
  id: "test-skill-req",
  type: "skill_proficiency",
  sourceId: "test-feature",
  sourceName: "Test Feature",
  wizardStage: "race",
  required: 2,
  label: "Choose 2 skills",
  pool: ["animal_handling", "insight", "medicine", "perception", "survival"],
  isBlocking: true,
  isResolved: false,
  current: []
};

export const NoSelection: Story = {
  args: {
    requirement: mockRequirement,
    currentSelections: [],
    onToggle: () => {},
  },
};

export const PartialSelection: Story = {
  args: {
    requirement: mockRequirement,
    currentSelections: ["animal_handling"],
    onToggle: () => {},
  },
};

export const FullSelection: Story = {
  args: {
    requirement: mockRequirement,
    currentSelections: ["animal_handling", "insight"],
    onToggle: () => {},
  },
};

export const ManySkills: Story = {
  args: {
    requirement: {
      ...mockRequirement,
      required: 3,
      pool: [
        "acrobatics",
        "animal_handling",
        "arcana",
        "athletics",
        "deception",
        "history",
        "insight",
        "intimidation",
        "investigation",
        "medicine",
        "nature",
        "perception",
        "performance",
        "persuasion",
        "religion",
        "sleight_of_hand",
        "stealth",
        "survival",
      ],
    },
    currentSelections: ["acrobatics"],
    onToggle: () => {},
  },
};

export const Interactive: Story = {
  args: {
    requirement: mockRequirement,
    currentSelections: [],
    onToggle: (skill) => alert(`Toggled ${skill}`),
  },
};
