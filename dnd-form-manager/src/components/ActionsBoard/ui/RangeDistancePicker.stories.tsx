import type { Meta, StoryObj } from "@storybook/react-vite";
import { RangeDistancePicker } from "./RangeDistancePicker";
import { fn } from "@storybook/test";

const meta: Meta<typeof RangeDistancePicker> = {
  title: "ActionsBoard/RangeDistancePicker",
  component: RangeDistancePicker,
  tags: ["autodocs"],
  args: { onChange: fn() },
};
export default meta;

type Story = StoryObj<typeof RangeDistancePicker>;

export const NormalRangeOnly: Story = {
  args: {
    entryId: "attack-shortbow",
    rangeInfo: { normal: 80, long: undefined },
    value: "normal",
  },
};

export const WithLongRange: Story = {
  args: {
    entryId: "attack-longbow",
    rangeInfo: { normal: 150, long: 600 },
    value: "normal",
  },
};

export const LongRangeSelected: Story = {
  args: {
    entryId: "attack-longbow",
    rangeInfo: { normal: 150, long: 600 },
    value: "long",
  },
};
