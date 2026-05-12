import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpellSlotHud } from "./SpellSlotHud";

const meta: Meta<typeof SpellSlotHud> = {
  title: "ActionsBoard/SpellSlotHud",
  component: SpellSlotHud,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof SpellSlotHud>;

export const Empty: Story = {
  args: { rows: [] },
};

export const WithSlots: Story = {
  args: {
    rows: [
      { label: "Lvl 1", text: "[ooo ]" },
      { label: "Lvl 2", text: "[oo  ]" },
      { label: "Lvl 3", text: "[o   ]" },
    ],
  },
};

export const WithPactSlot: Story = {
  args: {
    rows: [
      { label: "Lvl 1", text: "[oooo]" },
      { label: "Pact 3", text: "[oo  ]" },
    ],
  },
};
