import type { Meta, StoryObj } from "@storybook/react-vite";
import { IdentityHeaderView } from "./IdentityHeaderView";
import { IDENTITY_HEADER_FIXTURES } from "./IdentityHeader.fixtures";

const meta: Meta<typeof IdentityHeaderView> = {
  title: "Boards/IdentityHeader",
  component: IdentityHeaderView,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof IdentityHeaderView>;

const baseCallbacks = {
  onCharacterNameChange: () => {},
  onPlayerNameChange: () => {},
  onAlignmentChange: () => {},
  onXpChange: () => {},
  onLevelUpModeChange: () => {},
  onClassModalClick: () => {},
  onBackgroundModalClick: () => {},
  onRaceModalClick: () => {},
};

export const NewAdventurer: Story = {
  args: {
    ...IDENTITY_HEADER_FIXTURES.newAdventurer,
    ...baseCallbacks,
  },
};

export const FighterLevel5: Story = {
  args: {
    ...IDENTITY_HEADER_FIXTURES.fighterLevel5,
    ...baseCallbacks,
  },
};

export const MilestoneCampaign: Story = {
  args: {
    ...IDENTITY_HEADER_FIXTURES.milestoneCampaign,
    ...baseCallbacks,
  },
};

export const MulticlassHero: Story = {
  args: {
    ...IDENTITY_HEADER_FIXTURES.multiclassHero,
    ...baseCallbacks,
  },
};

export const Playground: Story = {
  args: {
    ...IDENTITY_HEADER_FIXTURES.playground,
    ...baseCallbacks,
  },
};
