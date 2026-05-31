import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CharacterCreationWizardView } from "./CharacterCreationWizardView";
import { CHARACTER_CREATION_WIZARD_FIXTURES } from "./CharacterCreationWizard.fixtures";
import { WizardSelectionStageView } from "./WizardSelectionStageView";
import { WizardSpellSelectionStageView } from "./WizardSpellSelectionStageView";
import { WizardAbilityScoreStageView } from "./WizardAbilityScoreStageView";
import { WizardEquipmentSelectionStageView } from "./WizardEquipmentSelectionStageView";
import {
  CHARACTER_CREATION_COMPOSED_SCENARIO_REFS,
  resolveCharacterCreationComposedScenario,
  type CharacterCreationComposedScenarioKey,
} from "./CharacterCreationWizard.composed.fixtures";

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

export const ComposedScenarioSelector: Story = {
  render: () => {
    const [scenarioKey, setScenarioKey] =
      useState<CharacterCreationComposedScenarioKey>("raceStart");

    const scenario = resolveCharacterCreationComposedScenario(scenarioKey);

    const centerStage =
      scenario.centerStage.kind === "selection" ? (
        <WizardSelectionStageView
          {...scenario.centerStage.fixture}
          onExpandedBaseIdChange={() => {}}
          onExpandedSubIdChange={() => {}}
          onExpandedTraitIndexChange={() => {}}
          onSelect={() => {}}
        />
      ) : scenario.centerStage.kind === "spells" ? (
        <WizardSpellSelectionStageView
          {...scenario.centerStage.fixture}
          onCantripToggle={() => {}}
          onSpellToggle={() => {}}
        />
      ) : scenario.centerStage.kind === "abilities" ? (
        <WizardAbilityScoreStageView
          {...scenario.centerStage.fixture}
          onMethodChange={() => {}}
          onRollModeChange={() => {}}
          onStandardArrayChange={() => {}}
          onPointBuyInput={() => {}}
          onPointBuyOverrideChange={() => {}}
          onVirtualRollComplete={() => {}}
          onRerollAll={() => {}}
          onVirtualAssignmentChange={() => {}}
          onConfirm={() => {}}
          onContinue={() => {}}
        />
      ) : (
        <WizardEquipmentSelectionStageView
          {...scenario.centerStage.fixture}
          onSelectOption={() => {}}
          onSelectCategoryItem={() => {}}
        />
      );

    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <div
          className="card"
          style={{
            padding: "0.75rem 1rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <label htmlFor="wizard-scenario">Wizard scenario</label>
          <select
            id="wizard-scenario"
            value={scenarioKey}
            onChange={(event) =>
              setScenarioKey(event.target.value as CharacterCreationComposedScenarioKey)
            }
          >
            {Object.entries(CHARACTER_CREATION_COMPOSED_SCENARIO_REFS).map(
              ([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ),
            )}
          </select>
        </div>

        <CharacterCreationWizardView
          {...scenario.shell}
          centerStage={centerStage}
          onStepClick={() => {}}
          isStepDisabled={(index) => index > scenario.shell.disabledAfterStep}
        />
      </div>
    );
  },
};
