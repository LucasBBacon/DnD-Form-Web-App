import type { Meta, StoryObj } from "@storybook/react-vite";
import { TraitAccordion } from "./TraitAccordion";
import { fn } from "@storybook/test";

const traits = [
  {
    name: "Darkvision",
    shortDescription: "See in dim light within 60 feet.",
    fullDescription:
      "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions.",
    source: "base" as const,
  },
  {
    name: "Fey Ancestry",
    shortDescription: "Advantage on saves against charm effects.",
    fullDescription:
      "You have advantage on saving throws against being charmed, and magic can't put you to sleep.",
    source: "base" as const,
  },
];

const meta: Meta<typeof TraitAccordion> = {
  title: "CharacterCreationWizard/TraitAccordion",
  component: TraitAccordion,
  tags: ["autodocs"],
  args: { onToggle: fn() },
};
export default meta;

type Story = StoryObj<typeof TraitAccordion>;

export const AllCollapsed: Story = {
  args: { traits, expandedIndex: null },
};

export const FirstExpanded: Story = {
  args: { traits, expandedIndex: 0 },
};

export const Empty: Story = {
  args: { traits: [], expandedIndex: null },
};
