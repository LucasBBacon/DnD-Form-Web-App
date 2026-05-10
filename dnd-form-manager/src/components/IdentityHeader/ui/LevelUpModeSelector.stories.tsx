import type { Meta, StoryObj } from "@storybook/react-vite";
import { LevelUpModeSelector } from "./LevelUpModeSelector";

const meta = {
  title: "Components/IdentityHeader/LevelUpModeSelector",
  component: LevelUpModeSelector,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LevelUpModeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const XpGated: Story = {
  args: {
    value: "xp_gated",
    onChange: () => {},
  },
};

export const MilestoneAnytime: Story = {
  args: {
    value: "milestone_anytime",
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    value: "xp_gated",
    onChange: () => alert("Level up mode changed"),
  },
};
