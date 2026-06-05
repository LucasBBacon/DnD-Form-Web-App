import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SpellSlotAbacus, type SpellSlotAbacusProps } from "./SpellSlotAbacus";

const toRomanNumeral = (level: number): string =>
  ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][level] ??
  level.toString();

const meta: Meta<typeof SpellSlotAbacus> = {
  title: "ActionsBoard/SpellSlotAbacus",
  component: SpellSlotAbacus,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    toRomanNumeral,
    onToggleSlot: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof SpellSlotAbacus>;

const sharedOnlySlots: SpellSlotAbacusProps["slots"] = {
  shared: {
    1: { total: 4, expended: 1 },
    2: { total: 3, expended: 0 },
    3: { total: 2, expended: 1 },
  },
  pact: null,
};

const pactOnlySlots: SpellSlotAbacusProps["slots"] = {
  shared: {
    1: { total: 0, expended: 0 },
    2: { total: 0, expended: 0 },
    3: { total: 0, expended: 0 },
  },
  pact: { level: 3, total: 2, expended: 1 },
};

const mixedSlots: SpellSlotAbacusProps["slots"] = {
  shared: {
    1: { total: 4, expended: 2 },
    2: { total: 3, expended: 1 },
  },
  pact: { level: 2, total: 2, expended: 0 },
};

export const SharedSlotsOnly: Story = {
  args: {
    slots: sharedOnlySlots,
  },
};

export const PactMagicOnly: Story = {
  args: {
    slots: pactOnlySlots,
  },
};

export const MixedSharedAndPact: Story = {
  args: {
    slots: mixedSlots,
  },
};

export const AllSlotsExpended: Story = {
  args: {
    slots: {
      shared: {
        1: { total: 4, expended: 4 },
        2: { total: 3, expended: 3 },
        3: { total: 2, expended: 2 },
      },
      pact: { level: 5, total: 2, expended: 2 },
    },
  },
};

export const ReadOnlyDisplay: Story = {
  args: {
    slots: sharedOnlySlots,
    onToggleSlot: undefined,
  },
};

export const NoSpellSlots: Story = {
  args: {
    slots: {
      shared: {},
      pact: null,
    },
  },
};

export const InteractiveToggle: Story = {
  render: ({ slots, toRomanNumeral, onToggleSlot }) => {
    const [localSlots, setLocalSlots] = useState(slots);

    return (
      <SpellSlotAbacus
        slots={localSlots}
        toRomanNumeral={toRomanNumeral}
        onToggleSlot={(type, level, isExpending) => {
          setLocalSlots((current) => {
            if (type === "pact") {
              if (!current.pact || current.pact.level !== level) return current;

              const nextExpended = isExpending
                ? Math.min(current.pact.expended + 1, current.pact.total)
                : Math.max(current.pact.expended - 1, 0);

              return {
                ...current,
                pact: {
                  ...current.pact,
                  expended: nextExpended,
                },
              };
            }

            const levelData = current.shared[level];
            if (!levelData) return current;

            const nextExpended = isExpending
              ? Math.min(levelData.expended + 1, levelData.total)
              : Math.max(levelData.expended - 1, 0);

            return {
              ...current,
              shared: {
                ...current.shared,
                [level]: {
                  ...levelData,
                  expended: nextExpended,
                },
              },
            };
          });

          onToggleSlot?.(type, level, isExpending);
        }}
      />
    );
  },
  args: {
    slots: mixedSlots,
  },
};
