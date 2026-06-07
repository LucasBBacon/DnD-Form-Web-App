import type { Meta, StoryObj } from "@storybook/react-vite";
import { getClassById } from "../../../data/staticDataApi";
import type { CharacterState } from "../../../store/useCharacterStore";
import { SpellChoiceStep } from "./SpellChoiceStep";
import {
  createStoryDraft,
  createStoryPlan,
  LevelUpStepStoryShell,
  StoryCharacterState,
  useInteractiveDraft,
} from "./LevelUpStoryHelpers";

const meta = {
  title: "Flows/LevelUp/Steps/SpellChoiceStep",
  component: SpellChoiceStep,
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
} satisfies Meta<typeof SpellChoiceStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const wizardClass = getClassById("class_wizard");

const wizardState: Partial<CharacterState> = {
  level: 2,
  classId: "class_wizard",
  classTracks: [{ classId: "class_wizard", subclassId: null, level: 2 }],
  spellsKnown: ["spell_acid_splash", "spell_burning_hands"],
};

export const LearnCantripAndSpell: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        currentStepId: "spell_choice",
        targetClassId: "class_wizard",
        targetClassLevel: 3,
        cantripsLearned: ["spell_chill_touch"],
        spellsLearned: ["spell_charm_person"],
      }),
    );

    return (
      <StoryCharacterState state={wizardState}>
        <LevelUpStepStoryShell>
          <SpellChoiceStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={
              createStoryPlan({
                requirements: {
                  newCantripsToLearn: 1,
                  newSpellsToLearn: 1,
                },
              })
            }
            classData={wizardClass}
            subclassData={null}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};

export const CantripsOnly: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        currentStepId: "spell_choice",
        targetClassId: "class_wizard",
        targetClassLevel: 4,
      }),
    );

    return (
      <StoryCharacterState state={wizardState}>
        <LevelUpStepStoryShell>
          <SpellChoiceStep
            draft={draft}
            onUpdateDraft={updateDraft}
            plan={
              createStoryPlan({
                requirements: {
                  newCantripsToLearn: 1,
                  newSpellsToLearn: 0,
                },
              })
            }
            classData={wizardClass}
            subclassData={null}
          />
        </LevelUpStepStoryShell>
      </StoryCharacterState>
    );
  },
};
