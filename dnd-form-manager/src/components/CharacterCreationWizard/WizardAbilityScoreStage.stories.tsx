import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Ability } from "../../types/common";
import { validatePointBuyAssignment } from "../../utils/abilityAssignmentUtils";
import { WizardAbilityScoreStageView } from "./WizardAbilityScoreStageView";
import { WIZARD_ABILITY_SCORE_FIXTURES } from "./WizardAbilityScoreStage.fixtures";

const meta: Meta<typeof WizardAbilityScoreStageView> = {
  title: "Wizard/WizardAbilityScoreStage",
  component: WizardAbilityScoreStageView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof WizardAbilityScoreStageView>;

const baseCallbacks = {
  onMethodChange: () => {},
  onRollModeChange: () => {},
  onStandardArrayChange: () => {},
  onPointBuyInput: () => {},
  onPointBuyOverrideChange: () => {},
  onVirtualRollComplete: () => {},
  onRerollAll: () => {},
  onVirtualAssignmentChange: () => {},
  onConfirm: () => {},
  onContinue: () => {},
};

export const StandardArrayValid: Story = {
  args: {
    ...WIZARD_ABILITY_SCORE_FIXTURES.standardArrayValid,
    ...baseCallbacks,
  },
};

export const PointBuyInvalidNeedsOverride: Story = {
  args: {
    ...WIZARD_ABILITY_SCORE_FIXTURES.pointBuyInvalidNeedsOverride,
    ...baseCallbacks,
  },
};

export const RollingVirtualInProgress: Story = {
  args: {
    ...WIZARD_ABILITY_SCORE_FIXTURES.rollingVirtualInProgress,
    ...baseCallbacks,
  },
};

export const RollingPhysicalValid: Story = {
  args: {
    ...WIZARD_ABILITY_SCORE_FIXTURES.rollingPhysicalValid,
    ...baseCallbacks,
  },
};

export const InteractivePointBuy: Story = {
  render: () => {
    const fixture = WIZARD_ABILITY_SCORE_FIXTURES.pointBuyInvalidNeedsOverride;
    const [baseScores, setBaseScores] = useState(fixture.baseScores);
    const [override, setOverride] = useState(false);

    const pointBuy = useMemo(() => validatePointBuyAssignment(baseScores), [baseScores]);
    const isPointBuyComplete = pointBuy.isStrictlyValid || override;

    const setAbilityScore = (ability: Ability, value: number) => {
      const clamped = Math.max(3, Math.min(18, Math.floor(value || 0)));
      setBaseScores((current) => ({
        ...current,
        [ability]: clamped,
      }));
    };

    return (
      <WizardAbilityScoreStageView
        {...fixture}
        baseScores={baseScores}
        pointBuy={pointBuy}
        pointBuyOverride={override}
        isPointBuyComplete={isPointBuyComplete}
        canContinue={isPointBuyComplete}
        error={null}
        onPointBuyInput={setAbilityScore}
        onPointBuyOverrideChange={setOverride}
        onMethodChange={() => {}}
        onRollModeChange={() => {}}
        onStandardArrayChange={() => {}}
        onVirtualRollComplete={() => {}}
        onRerollAll={() => {}}
        onVirtualAssignmentChange={() => {}}
        onConfirm={() => {}}
        onContinue={() => {}}
      />
    );
  },
};
