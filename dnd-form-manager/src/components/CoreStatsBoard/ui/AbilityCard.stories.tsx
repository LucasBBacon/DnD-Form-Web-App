import type { Meta, StoryObj } from "@storybook/react-vite";
import { AbilityCard } from "./AbilityCard";

const makeSkill = (
  key: string,
  label: string,
  modifier: number,
  overrides?: Partial<
    (typeof Strength.args.ability.skills extends Array<infer T> ? T : never)
  >,
) => ({
  key,
  label,
  modifier,
  isProficient: false,
  isExpertise: false,
  hasAdvantage: false,
  hasDisadvantage: false,
  tooltip: "",
  ...overrides,
});

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
    ability: {
      key: "strength",
      abilityName: "Strength",
      score: 18,
      modifier: 4,
      save: { modifier: 6, isProficient: true },
      skills: strSkills,
    },
  },
};

export const Intelligence: Story = {
  args: {
    ability: {
      key: "intelligence",
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
  },
};

export const NoSkills: Story = {
  args: {
    ability: {
      key: "charisma",
      abilityName: "Charisma",
      score: 8,
      modifier: -1,
      save: { modifier: -1, isProficient: false },
      skills: [],
    },
  },
};

export const AdvantageSkill: Story = {
  args: {
    ability: {
      key: "wisdom",
      abilityName: "Wisdom",
      score: 16,
      modifier: 3,
      save: { modifier: 3, isProficient: false },
      skills: [
        makeSkill("perception", "Perception", 5, {
          isProficient: true,
          hasAdvantage: true,
          tooltip: "Advantage: Keen senses from active effect.",
        }),
      ],
    },
  },
};

export const DisadvantageSkill: Story = {
  args: {
    ability: {
      key: "dexterity",
      abilityName: "Dexterity",
      score: 14,
      modifier: 2,
      save: { modifier: 2, isProficient: false },
      skills: [
        makeSkill("stealth", "Stealth", 0, {
          hasDisadvantage: true,
          tooltip: "Disadvantage: Heavy armor imposes stealth penalty.",
        }),
      ],
    },
  },
};

export const ExpertiseSkill: Story = {
  args: {
    ability: {
      key: "intelligence-expertise",
      abilityName: "Intelligence",
      score: 18,
      modifier: 4,
      save: { modifier: 4, isProficient: false },
      skills: [
        makeSkill("arcana", "Arcana", 10, {
          isProficient: true,
          isExpertise: true,
          tooltip: "Expertise doubles proficiency bonus.",
        }),
      ],
    },
  },
};

export const ConflictingAdvantageFlags: Story = {
  args: {
    ability: {
      key: "dexterity-conflict",
      abilityName: "Dexterity",
      score: 16,
      modifier: 3,
      save: { modifier: 6, isProficient: true },
      skills: [
        makeSkill("acrobatics", "Acrobatics", 6, {
          isProficient: true,
          hasAdvantage: true,
          hasDisadvantage: true,
          tooltip: "Both flags present to validate visual conflict handling.",
        }),
      ],
    },
  },
};

export const MixedLedger: Story = {
  args: {
    ability: {
      key: "wisdom-mixed",
      abilityName: "Wisdom",
      score: 12,
      modifier: 1,
      save: { modifier: 4, isProficient: true },
      skills: [
        makeSkill("animal-handling", "Animal Handling", 1),
        makeSkill("insight", "Insight", 4, {
          isProficient: true,
          tooltip: "Proficient from class training.",
        }),
        makeSkill("medicine", "Medicine", 1, {
          hasDisadvantage: true,
          tooltip: "Disadvantage: Exhaustion level 1.",
        }),
        makeSkill("perception", "Perception", 7, {
          isProficient: true,
          isExpertise: true,
          hasAdvantage: true,
          tooltip: "Advantage + expertise from magical focus and training.",
        }),
        makeSkill("survival", "Survival", 3, {
          isProficient: true,
        }),
      ],
    },
  },
};
