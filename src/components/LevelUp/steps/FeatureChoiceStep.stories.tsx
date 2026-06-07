import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PendingFeatureChoice } from "../../../utils/choiceUtils";
import { FeatureChoiceStep } from "./FeatureChoiceStep";
import {
  createStoryDraft,
  createStoryPlan,
  LevelUpStepStoryShell,
  useInteractiveDraft,
} from "./LevelUpStoryHelpers";

const meta = {
  title: "Flows/LevelUp/Steps/FeatureChoiceStep",
  component: FeatureChoiceStep,
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
} satisfies Meta<typeof FeatureChoiceStep>;

export default meta;
type Story = StoryObj<typeof meta>;

const pendingFeatureChoices: PendingFeatureChoice[] = [
  {
    sourceId: "trait_bonus_spell",
    sourceName: "Bonus Spell Pick",
    effectType: "feature_choice",
    count: 1,
    pool: ["spell_bless", "spell_command", "spell_cure_wounds"],
    allowCustomValue: false,
  },
  {
    sourceId: "trait_languages_of_the_realm",
    sourceName: "Languages of the Realm",
    effectType: "feature_choice",
    count: 1,
    pool: [],
    allowCustomValue: true,
  },
];

export const MixedFeatureChoices: Story = {
  render: () => {
    const { draft, updateDraft } = useInteractiveDraft(
      createStoryDraft({
        currentStepId: "feature_choice",
        featureChoices: {
          trait_bonus_spell: "spell_command",
          trait_languages_of_the_realm: "draconic",
        },
      }),
    );

    return (
      <LevelUpStepStoryShell>
        <FeatureChoiceStep
          draft={draft}
          onUpdateDraft={updateDraft}
          plan={
            createStoryPlan({
              pendingFeatureChoices,
              isComplete: false,
              completionErrors: ["Languages of the Realm: select a feature option."],
            })
          }
          classData={null}
          subclassData={null}
        />
      </LevelUpStepStoryShell>
    );
  },
};

export const NoFeatureChoices: Story = {
  render: () => (
    <LevelUpStepStoryShell>
      <FeatureChoiceStep
        draft={createStoryDraft({ currentStepId: "feature_choice" })}
        onUpdateDraft={() => {}}
        plan={createStoryPlan()}
        classData={null}
        subclassData={null}
      />
    </LevelUpStepStoryShell>
  ),
};
