import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeatureCard } from "./FeatureCard";

const meta: Meta<typeof FeatureCard> = {
  title: "RoleplayBoard/FeatureCard",
  component: FeatureCard,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FeatureCard>;

export const RaceFeature: Story = {
  args: {
    name: "Darkvision",
    sources: [{ key: "race-elf", kind: "race", label: "Elf" }],
    description: "You can see in dim light within 60 feet of you as if it were bright light.",
  },
};

export const ClassFeature: Story = {
  args: {
    name: "Rage",
    sources: [{ key: "class-barbarian-1", kind: "class", label: "Barbarian 1" }],
    description: "In battle, you fight with primal ferocity.",
  },
};

export const MultipleSourceBadges: Story = {
  args: {
    name: "Extra Attack",
    sources: [
      { key: "class-fighter-5", kind: "class", label: "Fighter 5" },
      { key: "feat-warcaster", kind: "feat", label: "War Caster" },
    ],
    description: "You can attack twice, instead of once, whenever you take the Attack action.",
  },
};
