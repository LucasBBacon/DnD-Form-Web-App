import type { Meta, StoryObj } from "@storybook/react-vite";
import { CoreStatsBoardView } from "./CoreStatsBoardView";
import { CORE_STATS_BOARD_FIXTURES } from "./CoreStatsBoard.fixtures";

const meta: Meta<typeof CoreStatsBoardView> = {
  title: "Boards/CoreStatsBoard",
  component: CoreStatsBoardView,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CoreStatsBoardView>;

export const Balanced: Story = {
  args: {
    ...CORE_STATS_BOARD_FIXTURES.balanced,
  },
};

export const Specialist: Story = {
  args: {
    ...CORE_STATS_BOARD_FIXTURES.specialist,
  },
};

export const LowLevel: Story = {
  args: {
    ...CORE_STATS_BOARD_FIXTURES.lowLevel,
  },
};

export const Pressured: Story = {
  args: {
    ...CORE_STATS_BOARD_FIXTURES.pressured,
  },
};

export const Playground: Story = {
  args: {
    ...CORE_STATS_BOARD_FIXTURES.playground,
  },
};
