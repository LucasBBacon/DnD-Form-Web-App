import type { Meta, StoryObj } from "@storybook/react-vite";
import { getClassById } from "../../../data/staticDataApi";
import type { CharacterState } from "../../../store/useCharacterStore";
import { SubclassPickStep } from "./SubclassPickStep";
import {
  createStoryDraft,
  createStoryPlan,
  LevelUpStepStoryShell,
  StoryCharacterState,
  useInteractiveDraft,
} from "../LevelUpStoryHelpers";

const meta = {
  title: "LevelUp/SubclassPickStep",
  component: SubclassPickStep,
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
} satisfies Meta<typeof SubclassPickStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const fighterClass = getClassById("class_fighter");

const fighterState: Partial<CharacterState> = {
  level: 2,
  classId: "class_fighter",
  classTracks: [{ classId: "class_fighter", subclassId: null, level: 2 }],
};

export const FighterSubclassChoice: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        targetClassId: "class_fighter",
        targetClassLevel: 3,
        currentStepId: "subclass_pick",
      }),
    );

    return (
      <StoryCharacterState state={fighterState}>
        <LevelUpStepStoryShell>
          <SubclassPickStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan({ requirements: { requiresSubclass: true } })}
            classData={fighterClass}
            subclassData={null}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};

export const PreselectedSubclass: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        targetClassId: "class_fighter",
        targetClassLevel: 3,
        currentStepId: "subclass_pick",
        newSubclassId: "subclass_fighter_battle_master",
      }),
    );

    return (
      <StoryCharacterState state={fighterState}>
        <LevelUpStepStoryShell>
          <SubclassPickStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan({ requirements: { requiresSubclass: true } })}
            classData={fighterClass}
            subclassData={null}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};
