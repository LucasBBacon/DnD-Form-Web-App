import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CharacterCreationWizardView } from "./CharacterCreationWizardView";
import { CHARACTER_CREATION_WIZARD_FIXTURES } from "./CharacterCreationWizard.fixtures";

const meta: Meta<typeof CharacterCreationWizardView> = {
  title: "Flows/CharacterCreationWizard",
  component: CharacterCreationWizardView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof CharacterCreationWizardView>;

const centerStagePanel = (text: string) => (
  <div className="card" style={{ padding: "1rem" }}>
    <h2 style={{ marginTop: 0 }}>Center Stage Preview</h2>
    <p>{text}</p>
  </div>
);

export const FreshStart: Story = {
  args: {
    ...CHARACTER_CREATION_WIZARD_FIXTURES.freshStart,
    centerStage: centerStagePanel("Choose your race to begin character creation."),
    onStepClick: () => {},
    isStepDisabled: (index) =>
      index > CHARACTER_CREATION_WIZARD_FIXTURES.freshStart.disabledAfterStep,
  },
};

export const ClassChosen: Story = {
  args: {
    ...CHARACTER_CREATION_WIZARD_FIXTURES.classChosen,
    centerStage: centerStagePanel("Spells stage with class already selected."),
    onStepClick: () => {},
    isStepDisabled: (index) =>
      index > CHARACTER_CREATION_WIZARD_FIXTURES.classChosen.disabledAfterStep,
  },
};

export const BlockedFinish: Story = {
  args: {
    ...CHARACTER_CREATION_WIZARD_FIXTURES.blockedFinish,
    centerStage: centerStagePanel("Identity stage blocked by unresolved requirements."),
    onStepClick: () => {},
    isStepDisabled: (index) =>
      index > CHARACTER_CREATION_WIZARD_FIXTURES.blockedFinish.disabledAfterStep,
  },
};

export const InteractiveStepper: Story = {
  render: () => {
    const fixture = CHARACTER_CREATION_WIZARD_FIXTURES.classChosen;
    const [currentStepIndex, setCurrentStepIndex] = useState(fixture.currentStepIndex);

    return (
      <CharacterCreationWizardView
        {...fixture}
        currentStepIndex={currentStepIndex}
        centerStage={centerStagePanel(`Currently viewing step #${currentStepIndex + 1}.`)}
        onStepClick={(index) => setCurrentStepIndex(index)}
        isStepDisabled={(index) => index > fixture.disabledAfterStep}
      />
    );
  },
};
