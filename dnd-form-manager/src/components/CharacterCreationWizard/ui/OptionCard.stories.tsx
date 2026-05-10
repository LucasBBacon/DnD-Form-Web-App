import type { Meta, StoryObj } from "@storybook/react-vite";
import { OptionCard } from "./OptionCard";
import { fn } from "@storybook/test";

const option = {
  id: "elf",
  name: "Elf",
  tagline: "Graceful, keen-sensed, magical.",
  description: "Elves are a magical people...",
  traits: [],
  subOptions: [],
};

const meta: Meta<typeof OptionCard> = {
  title: "CharacterCreationWizard/OptionCard",
  component: OptionCard,
  tags: ["autodocs"],
  args: { onClick: fn() },
};
export default meta;

type Story = StoryObj<typeof OptionCard>;

export const Unselected: Story = {
  args: { option, isSelected: false },
};

export const Selected: Story = {
  args: { option, isSelected: true },
};

export const LongTagline: Story = {
  args: {
    option: {
      ...option,
      id: "human",
      name: "Human",
      tagline:
        "Ambitious, diverse, and adaptable — humanity's greatest strength lies in its variety.",
    },
    isSelected: false,
  },
};
