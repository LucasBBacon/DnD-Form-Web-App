import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SpellLevelSelector } from "./SpellLevelSelector";

const meta: Meta<typeof SpellLevelSelector> = {
  component: SpellLevelSelector,
  title: "Components/ActionsBoard/SpellLevelSelector",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Helper component to manage state for the story
 */
const SpellLevelSelectorWithState = (
  props: Omit<
    React.ComponentProps<typeof SpellLevelSelector>,
    "selectedLevel" | "selectedPool" | "onLevelChange" | "onPoolChange"
  >,
) => {
  const [selectedLevel, setSelectedLevel] = useState(props.baseLevel);
  const [selectedPool, setSelectedPool] = useState<"shared" | "pact">(
    props.canUseShared ? "shared" : "pact",
  );

  return (
    <SpellLevelSelector
      {...props}
      selectedLevel={selectedLevel}
      selectedPool={selectedPool}
      onLevelChange={setSelectedLevel}
      onPoolChange={setSelectedPool}
    />
  );
};

export const CantripsHidden: Story = {
  render: (args) => <SpellLevelSelectorWithState {...args} />,
  args: {
    baseLevel: 0,
    availableLevels: [0],
    canUseShared: true,
    canUsePact: false,
  },
};

export const SingleLevelHidden: Story = {
  render: (args) => <SpellLevelSelectorWithState {...args} />,
  args: {
    baseLevel: 1,
    availableLevels: [1],
    canUseShared: true,
    canUsePact: false,
  },
};

export const UpcutableWithSharedSlots: Story = {
  render: (args) => <SpellLevelSelectorWithState {...args} />,
  args: {
    baseLevel: 3,
    availableLevels: [3, 4, 5, 6, 7, 8, 9],
    canUseShared: true,
    canUsePact: false,
    formatLevel: (level) => {
      const suffix =
        level % 10 === 1 && level % 100 !== 11
          ? "st"
          : level % 10 === 2 && level % 100 !== 12
            ? "nd"
            : level % 10 === 3 && level % 100 !== 13
              ? "rd"
              : "th";
      return `${level}${suffix}`;
    },
  },
};

export const UpcutableWithBothPools: Story = {
  render: (args) => <SpellLevelSelectorWithState {...args} />,
  args: {
    baseLevel: 3,
    availableLevels: [3, 4, 5, 6, 7, 8, 9],
    canUseShared: true,
    canUsePact: true,
    formatLevel: (level) => {
      const suffix =
        level % 10 === 1 && level % 100 !== 11
          ? "st"
          : level % 10 === 2 && level % 100 !== 12
            ? "nd"
            : level % 10 === 3 && level % 100 !== 13
              ? "rd"
              : "th";
      return `${level}${suffix}`;
    },
  },
};

export const OnlyPactAvailable: Story = {
  render: (args) => <SpellLevelSelectorWithState {...args} />,
  args: {
    baseLevel: 2,
    availableLevels: [2, 3, 4, 5, 6],
    canUseShared: false,
    canUsePact: true,
    formatLevel: (level) => {
      const suffix =
        level % 10 === 1 && level % 100 !== 11
          ? "st"
          : level % 10 === 2 && level % 100 !== 12
            ? "nd"
            : level % 10 === 3 && level % 100 !== 13
              ? "rd"
              : "th";
      return `${level}${suffix}`;
    },
  },
};

export const WarlockMulticlassScenario: Story = {
  render: (args) => <SpellLevelSelectorWithState {...args} />,
  args: {
    baseLevel: 1,
    availableLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9], // Multiclass with many levels
    canUseShared: true,
    canUsePact: true,
    formatLevel: (level) => {
      const suffix =
        level % 10 === 1 && level % 100 !== 11
          ? "st"
          : level % 10 === 2 && level % 100 !== 12
            ? "nd"
            : level % 10 === 3 && level % 100 !== 13
              ? "rd"
              : "th";
      return `${level}${suffix}`;
    },
  },
};
