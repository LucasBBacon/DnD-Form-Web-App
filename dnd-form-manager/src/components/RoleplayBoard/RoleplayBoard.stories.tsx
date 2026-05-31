import type { Meta, StoryObj } from "@storybook/react-vite";
import { RoleplayBoardView } from "./RoleplayBoardView";
import { ROLEPLAY_BOARD_FIXTURES } from "./RoleplayBoard.fixtures";

const meta: Meta<typeof RoleplayBoardView> = {
  title: "Boards/RoleplayBoard",
  component: RoleplayBoardView,
  tags: ["autodocs"],
  argTypes: {
    activeTab: {
      control: "select",
      options: ["characteristics", "biography"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof RoleplayBoardView>;

const baseCallbacks = {
  onTabChange: () => {},
  onRoleplayFieldBlur: () => {},
};

export const FeaturesEmpty: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.featuresEmpty,
    ...baseCallbacks,
  },
};

export const FeaturesLoaded: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.featuresLoaded,
    ...baseCallbacks,
  },
};

export const CharacteristicsFilled: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.characteristicsFilled,
    ...baseCallbacks,
  },
};

export const BiographyDetailed: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.biographyDetailed,
    ...baseCallbacks,
  },
};

export const Playground: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.playground,
    ...baseCallbacks,
  },
};
