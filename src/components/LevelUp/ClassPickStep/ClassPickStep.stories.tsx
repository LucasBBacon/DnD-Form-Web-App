import type { Meta, StoryObj } from "@storybook/react-vite";
import { getClassById } from "../../../data/staticDataApi";
import type { CharacterState } from "../../../store/useCharacterStore";
import { ClassPickStep } from "./ClassPickStep";
import {
  createStoryDraft,
  createStoryPlan,
  LevelUpStepStoryShell,
  StoryCharacterState,
  useInteractiveDraft,
} from "../LevelUpStoryHelpers";

const meta = {
  title: "LevelUp/ClassPickStep",
  component: ClassPickStep,
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
    classTracks: [],
  },
} satisfies Meta<typeof ClassPickStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const fighterClass = getClassById("class_fighter");

const multiclassState: Partial<CharacterState> = {
  level: 5,
  classId: "class_fighter",
  classTracks: [
    { classId: "class_fighter", subclassId: "subclass_fighter_champion", level: 3 },
    { classId: "class_rogue", subclassId: null, level: 2 },
  ],
  baseAbilityScores: {
    str: 14,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 10,
  },
};

const lowAbilityState: Partial<CharacterState> = {
  level: 4,
  classId: "class_fighter",
  classTracks: [{ classId: "class_fighter", subclassId: null, level: 4 }],
  baseAbilityScores: {
    str: 8,
    dex: 8,
    con: 10,
    int: 10,
    wis: 8,
    cha: 8,
  },
};

export const ExistingOrNewMulticlass: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        targetClassId: "class_rogue",
        targetClassLevel: 3,
        isNewMulticlass: false,
      }),
    );

    return (
      <StoryCharacterState state={multiclassState}>
        <LevelUpStepStoryShell>
          <ClassPickStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan()}
            classData={fighterClass}
            subclassData={null}
            targetLevel={6}
            classTracks={multiclassState.classTracks ?? []}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};

export const IneligibleMulticlassOptions: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        targetClassId: "class_fighter",
        targetClassLevel: 5,
        isNewMulticlass: false,
      }),
    );

    return (
      <StoryCharacterState state={lowAbilityState}>
        <LevelUpStepStoryShell>
          <ClassPickStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan()}
            classData={fighterClass}
            subclassData={null}
            targetLevel={5}
            classTracks={lowAbilityState.classTracks ?? []}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};
