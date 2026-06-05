import type { Meta, StoryObj } from "@storybook/react-vite";
import { CombatDefenses } from "./CombatDefenses";

const meta: Meta<typeof CombatDefenses> = {
  title: "VitalsBoard/CombatDefenses",
  component: CombatDefenses,
  tags: ["autodocs"],
  args: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
  },
};

export default meta;

type Story = StoryObj<typeof CombatDefenses>;

export const StandardAdventurer: Story = {
  args: {
    armorClass: 16,
    initiative: 2,
    speed: 30,
    isArmorPenalized: false,
  },
};

export const ArmoredBulwark: Story = {
  args: {
    armorClass: 21,
    initiative: 0,
    speed: 25,
    isArmorPenalized: false,
  },
};

export const HeavyArmorStrengthPenalty: Story = {
  args: {
    armorClass: 18,
    initiative: -1,
    speed: 20,
    isArmorPenalized: true,
  },
};

export const NimbleStriker: Story = {
  args: {
    armorClass: 14,
    initiative: 7,
    speed: 40,
    isArmorPenalized: false,
  },
};

export const SlowReactionCaster: Story = {
  args: {
    armorClass: 12,
    initiative: -3,
    speed: 30,
    isArmorPenalized: false,
  },
};

export const Playground: Story = {};
