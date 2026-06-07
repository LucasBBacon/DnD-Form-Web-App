import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ReviewStep } from "./ReviewStep";
import {
  createStoryDraft,
  createStoryPlan,
  LevelUpStepStoryShell,
} from "./LevelUpStoryHelpers";

const meta = {
  title: "Flows/LevelUp/Steps/ReviewStep",
  component: ReviewStep,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    onConfirm: fn(),
  },
} satisfies Meta<typeof ReviewStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompleteSelectionSummary: Story = {
  args: {
    draft: createStoryDraft({
      currentStepId: "review",
      targetClassId: "class_fighter",
      targetClassLevel: 5,
      hpGained: 8,
      newSubclassId: "subclass_fighter_battle_master",
      asiChoices: { str: 2 },
      skillChoices: ["athletics", "perception"],
      weaponChoices: ["longsword"],
      toolChoices: ["smith_tools"],
      languageChoices: ["draconic"],
      cantripsLearned: ["spell_acid_splash"],
      spellsLearned: ["spell_bless"],
      featureChoices: {
        trait_bonus_spell: "spell_command",
      },
    }),
    onUpdateDraft: fn(),
    plan: createStoryPlan({
      isComplete: true,
      completionErrors: [],
    }),
    classData: null,
    subclassData: null,
    targetLevel: 5,
  },
  render: (args) => (
    <LevelUpStepStoryShell>
      <ReviewStep {...args} />
    </LevelUpStepStoryShell>
  ),
};

export const IncompleteWithErrors: Story = {
  args: {
    draft: createStoryDraft({
      currentStepId: "review",
      targetClassId: "class_wizard",
      targetClassLevel: 3,
      hpGained: null,
      spellsLearned: [],
      cantripsLearned: [],
    }),
    onUpdateDraft: fn(),
    plan: createStoryPlan({
      isComplete: false,
      completionErrors: [
        "HP gain not determined.",
        "Select 1 more spell(s) to learn.",
      ],
    }),
    classData: null,
    subclassData: null,
    targetLevel: 3,
  },
  render: (args) => (
    <LevelUpStepStoryShell>
      <ReviewStep {...args} />
    </LevelUpStepStoryShell>
  ),
};
