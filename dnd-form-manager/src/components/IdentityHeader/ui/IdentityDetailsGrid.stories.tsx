import type { Meta, StoryObj } from "@storybook/react-vite";
import { IdentityDetailsGrid } from "./IdentityDetailsGrid";

const meta = {
  title: "Components/IdentityHeader/IdentityDetailsGrid",
  component: IdentityDetailsGrid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof IdentityDetailsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  classNameDisplay: "Wizard 5",
  backgroundNameDisplay: "Choose Background",
  playerName: "Alice",
  raceNameDisplay: "Human",
  alignment: "Neutral Good",
  xp: 6500,
  levelUpMode: "xp_gated" as const,
  onNameChange: () => {},
  onAlignmentChange: () => {},
  onXpChange: () => {},
  onLevelUpModeChange: () => {},
  onClassModalClick: () => {},
  onBackgroundModalClick: () => {},
  onRaceModalClick: () => {},
};

export const Default: Story = {
  args: defaultArgs,
};

export const HighLevel: Story = {
  args: {
    ...defaultArgs,
    classNameDisplay: "Paladin 20",
    xp: 355000,
  },
};

export const NoClass: Story = {
  args: {
    ...defaultArgs,
    classNameDisplay: "Choose Class",
    playerName: "",
  },
};

export const MilestoneMode: Story = {
  args: {
    ...defaultArgs,
    levelUpMode: "milestone_anytime" as const,
  },
};
