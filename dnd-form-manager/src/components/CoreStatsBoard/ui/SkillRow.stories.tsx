import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkillRow } from "./SkillRow";

const meta: Meta<typeof SkillRow> = {
  title: "CoreStatsBoard/SkillRow",
  component: SkillRow,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof SkillRow>;

export const Default: Story = {
  args: { label: "Perception", modifier: 5, isProficient: false },
};

export const Proficient: Story = {
  args: { label: "Perception", modifier: 7, isProficient: true },
};

export const Expertise: Story = {
  args: {
    label: "Stealth",
    modifier: 9,
    isProficient: true,
    isExpertise: true,
  },
};

export const WithAdvantage: Story = {
  args: {
    label: "Athletics",
    modifier: 4,
    isProficient: true,
    hasAdvantage: true,
    tooltip: "Advantage: Bear Totem",
  },
};

export const WithDisadvantage: Story = {
  args: {
    label: "Stealth",
    modifier: 3,
    isProficient: false,
    hasDisadvantage: true,
    tooltip: "Disadvantage: Heavy Armor",
  },
};

export const SavingThrow: Story = {
  args: {
    label: "Saving Throw",
    modifier: 6,
    isProficient: true,
    isSave: true,
  },
};

export const NegativeModifier: Story = {
  args: { label: "Deception", modifier: -1, isProficient: false },
};
