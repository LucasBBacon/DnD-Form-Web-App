import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PendingProficiencyChoice } from "../../../utils/choiceUtils";
import { ProficiencyChoiceStep } from "./ProficiencyChoiceStep";
import {
  createStoryDraft,
  createStoryPlan,
  LevelUpStepStoryShell,
  useInteractiveDraft,
} from "./LevelUpStoryHelpers";

const meta = {
  title: "Flows/LevelUp/Steps/ProficiencyChoiceStep",
  component: ProficiencyChoiceStep,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    draft: createStoryDraft(),
    onUpdateDraft: () => {},
    plan: createStoryPlan(),
    classData: null,
    subclassData: null,
  },
} satisfies Meta<typeof ProficiencyChoiceStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const pendingChoices: PendingProficiencyChoice[] = [
  {
    sourceId: "trait_bonus_skill_training",
    sourceName: "Bonus Skill Training",
    category: "skills",
    count: 2,
    pool: ["athletics", "history", "perception", "survival"],
  },
  {
    sourceId: "trait_tool_mastery",
    sourceName: "Tool Mastery",
    category: "tools",
    count: 1,
    pool: ["smith_tools", "thieves_tools", "herbalism_kit"],
  },
];

export const MultipleChoiceGroups: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        currentStepId: "proficiency_choice",
        proficiencySelectionsBySource: {
          "skills:trait_bonus_skill_training": ["athletics"],
          "tools:trait_tool_mastery": [],
        },
        skillChoices: ["athletics"],
      }),
    );

    return (
      <LevelUpStepStoryShell>
        <ProficiencyChoiceStep
          draft={draft}
          onUpdateDraft={updateDraft}
          plan={
            createStoryPlan({
              requirements: {
                requiresProficiencySelection: true,
                requiresSkillSelection: true,
              },
              pendingProficiencyChoices: pendingChoices,
              isComplete: false,
              completionErrors: ["Bonus Skill Training: select 1 more selection(s)."],
            })
          }
          classData={null}
          subclassData={null}
        />
      </LevelUpStepStoryShell>
    );
  },
};

export const NoPendingChoices: Story = {
  render: () => (
    <LevelUpStepStoryShell>
      <ProficiencyChoiceStep
        draft={createStoryDraft({ currentStepId: "proficiency_choice" })}
        onUpdateDraft={() => {}}
        plan={createStoryPlan()}
        classData={null}
        subclassData={null}
      />
    </LevelUpStepStoryShell>
  ),
};
