import type { Meta, StoryObj } from "@storybook/react-vite";
import { getClassById } from "../../../data/staticDataApi";
import type { CharacterState } from "../../../store/useCharacterStore";
import { HpGainStep } from "./HpGainStep";
import {
  createStoryDraft,
  createStoryPlan,
  LevelUpStepStoryShell,
  StoryCharacterState,
  useInteractiveDraft,
} from "../LevelUpStoryHelpers";

const meta = {
  title: "LevelUp/HpGainStep",
  component: HpGainStep,
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
    targetLevel: 2,
  },
} satisfies Meta<typeof HpGainStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const fighterClass = getClassById("class_fighter");

const sturdyState: Partial<CharacterState> = {
  level: 4,
  classId: "class_fighter",
  classTracks: [{ classId: "class_fighter", subclassId: null, level: 4 }],
  baseAbilityScores: {
    str: 15,
    dex: 12,
    con: 16,
    int: 8,
    wis: 10,
    cha: 10,
  },
};

export const AverageHpMode: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        targetClassId: "class_fighter",
        targetClassLevel: 5,
        currentStepId: "hp_gain",
        useAverageHp: true,
      }),
    );

    return (
      <StoryCharacterState state={sturdyState}>
        <LevelUpStepStoryShell>
          <HpGainStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan()}
            classData={fighterClass}
            subclassData={null}
            targetLevel={5}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};

export const ManualRollMode: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        targetClassId: "class_fighter",
        targetClassLevel: 5,
        currentStepId: "hp_gain",
        useAverageHp: false,
        hpGained: 9,
      }),
    );

    return (
      <StoryCharacterState state={sturdyState}>
        <LevelUpStepStoryShell>
          <HpGainStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan()}
            classData={fighterClass}
            subclassData={null}
            targetLevel={5}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};
