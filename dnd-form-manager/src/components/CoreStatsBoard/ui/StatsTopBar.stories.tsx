import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatsTopBar } from "./StatsTopBar";

const meta: Meta<typeof StatsTopBar> = {
  title: "CoreStatsBoard/StatsTopBar",
  component: StatsTopBar,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StatsTopBar>;

export const Default: Story = {
  args: {
    proficiencyBonus: 3,
    passives: { perception: 16, investigation: 12, insight: 13 },
  },
};

export const LowStats: Story = {
  args: {
    proficiencyBonus: 2,
    passives: { perception: 10, investigation: 10, insight: 10 },
  },
};
