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
      options: ["features", "characteristics", "biography", "spellbook"],
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
    spellbookView: <div>Spellbook Placeholder</div>,
  },
};

export const FeaturesLoaded: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.featuresLoaded,
    ...baseCallbacks,
    spellbookView: <div>Spellbook Placeholder</div>,
  },
};

export const CharacteristicsFilled: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.characteristicsFilled,
    ...baseCallbacks,
    spellbookView: <div>Spellbook Placeholder</div>,
  },
};

export const BiographyDetailed: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.biographyDetailed,
    ...baseCallbacks,
    spellbookView: <div>Spellbook Placeholder</div>,
  },
};

export const SpellbookTab: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.spellbookTab,
    ...baseCallbacks,
    spellbookView: <div data-testid="spellbook-placeholder">Spellbook Placeholder</div>,
  },
};

export const Playground: Story = {
  args: {
    ...ROLEPLAY_BOARD_FIXTURES.playground,
    ...baseCallbacks,
    spellbookView: <div>Spellbook Placeholder</div>,
  },
};
