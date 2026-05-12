import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShortRestModalView } from "./ShortRestModalView";
import { SHORT_REST_MODAL_FIXTURES } from "./ShortRestModal.fixtures";

const callbacks = {
  onClose: () => {},
  onApplyHitDie: () => {},
  onFinishShortRest: () => {},
  onConfirmLongRest: () => {},
};

const meta: Meta<typeof ShortRestModalView> = {
  title: "Overlays/ShortRestModal",
  component: ShortRestModalView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof ShortRestModalView>;

export const ShortStandard: Story = {
  args: {
    ...SHORT_REST_MODAL_FIXTURES.shortStandard,
    ...callbacks,
  },
};

export const ShortNoHitDice: Story = {
  args: {
    ...SHORT_REST_MODAL_FIXTURES.shortNoHitDice,
    ...callbacks,
  },
};

export const ShortFullyHealed: Story = {
  args: {
    ...SHORT_REST_MODAL_FIXTURES.shortFullyHealed,
    ...callbacks,
  },
};

export const LongRestConfirm: Story = {
  args: {
    ...SHORT_REST_MODAL_FIXTURES.longRestConfirm,
    ...callbacks,
  },
};
