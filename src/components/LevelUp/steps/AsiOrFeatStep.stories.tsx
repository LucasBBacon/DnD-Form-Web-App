import type { Meta, StoryObj } from "@storybook/react-vite";
import { getClassById } from "../../../data/staticDataApi";
import type { CharacterState } from "../../../store/useCharacterStore";
import { AsiOrFeatStep } from "./AsiOrFeatStep";
import {
  createStoryDraft,
  createStoryPlan,
  LevelUpStepStoryShell,
  StoryCharacterState,
  useInteractiveDraft,
} from "./LevelUpStoryHelpers";

const meta = {
  title: "Flows/LevelUp/Steps/AsiOrFeatStep",
  component: AsiOrFeatStep,
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
} satisfies Meta<typeof AsiOrFeatStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const fighterClass = getClassById("class_fighter");

const asiState: Partial<CharacterState> = {
  level: 4,
  classId: "class_fighter",
  classTracks: [{ classId: "class_fighter", subclassId: "subclass_fighter_champion", level: 4 }],
  subclassId: "subclass_fighter_champion",
  baseAbilityScores: {
    str: 15,
    dex: 13,
    con: 14,
    int: 10,
    wis: 10,
    cha: 8,
  },
};

export const AbilityScoreMode: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        currentStepId: "asi_or_feat",
        asiChoices: { str: 1 },
      }),
    );

    return (
      <StoryCharacterState state={asiState}>
        <LevelUpStepStoryShell>
          <AsiOrFeatStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan({ requirements: { requiresAsiOrFeat: true } })}
            classData={fighterClass}
            subclassData={null}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};

export const FeatMode: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        currentStepId: "asi_or_feat",
        featId: "feat_alert",
      }),
    );

    return (
      <StoryCharacterState state={asiState}>
        <LevelUpStepStoryShell>
          <AsiOrFeatStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan({ requirements: { requiresAsiOrFeat: true } })}
            classData={fighterClass}
            subclassData={null}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};

export const FeatPrerequisiteExample: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        currentStepId: "asi_or_feat",
        featId: "feat_battle_hardened",
      }),
    );

    return (
      <StoryCharacterState state={asiState}>
        <LevelUpStepStoryShell>
          <AsiOrFeatStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={createStoryPlan({ requirements: { requiresAsiOrFeat: true } })}
            classData={fighterClass}
            subclassData={null}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};
