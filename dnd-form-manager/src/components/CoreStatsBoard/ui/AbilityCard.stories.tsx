import type { Meta, StoryObj } from "@storybook/react-vite";
import { AbilityCard } from "./AbilityCard";

const strSkills = [
  {
    key: "athletics",
    label: "Athletics",
    modifier: 5,
    isProficient: true,
    isExpertise: false,
    hasAdvantage: false,
    hasDisadvantage: false,
    tooltip: "",
  },
];

const meta: Meta<typeof AbilityCard> = {
  title: "CoreStatsBoard/AbilityCard",
  component: AbilityCard,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof AbilityCard>;

export const Strength: Story = {
  args: {
    abilityName: "Strength",
    score: 18,
    modifier: 4,
    save: { modifier: 6, isProficient: true },
    skills: strSkills,
  },
};

export const Intelligence: Story = {
  args: {
    abilityName: "Intelligence",
    score: 10,
    modifier: 0,
    save: { modifier: 0, isProficient: false },
    skills: [
      {
        key: "arcana",
        label: "Arcana",
        modifier: 2,
        isProficient: true,
        isExpertise: false,
        hasAdvantage: false,
        hasDisadvantage: false,
        tooltip: "",
      },
      {
        key: "history",
        label: "History",
        modifier: 0,
        isProficient: false,
        isExpertise: false,
        hasAdvantage: false,
        hasDisadvantage: false,
        tooltip: "",
      },
    ],
  },
};

export const NoSkills: Story = {
  args: {
    abilityName: "Charisma",
    score: 8,
    modifier: -1,
    save: { modifier: -1, isProficient: false },
    skills: [],
  },
};
