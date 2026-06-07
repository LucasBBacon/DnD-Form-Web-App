import React, { useEffect, useMemo, useState } from "react";
import {
  BASELINE_CHARACTER_STATE,
  useCharacterStore,
  type CharacterState,
} from "../../../store/useCharacterStore";
import {
  createEmptyDraft,
  type LevelUpDraft,
} from "../../../types/levelUpDraft";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";

type StoryPlanOverrides = Omit<Partial<LevelUpPlannerResult>, "requirements"> & {
  requirements?: Partial<LevelUpPlannerResult["requirements"]>;
};

export const createStoryPlan = (
  overrides: StoryPlanOverrides = {},
): LevelUpPlannerResult => {
  const { requirements: _ignoredRequirements, ...restOverrides } = overrides;
  const requirementOverrides = overrides.requirements ?? {};

  return {
    orderedSteps: ["class_pick", "hp_gain", "review"],
    requirements: {
      requiresAsiOrFeat: requirementOverrides.requiresAsiOrFeat ?? false,
      requiresSubclass: requirementOverrides.requiresSubclass ?? false,
      requiresProficiencySelection:
        requirementOverrides.requiresProficiencySelection ?? false,
      requiresSkillSelection: requirementOverrides.requiresSkillSelection ?? false,
      newCantripsToLearn: requirementOverrides.newCantripsToLearn ?? 0,
      newSpellsToLearn: requirementOverrides.newSpellsToLearn ?? 0,
    },
    pendingProficiencyChoices: [],
    pendingFeatureChoices: [],
    isComplete: true,
    completionErrors: [],
    ...restOverrides,
  };
};

export const createStoryDraft = (
  overrides: Partial<LevelUpDraft> = {},
): LevelUpDraft => ({
  ...createEmptyDraft(),
  ...overrides,
});

export const useInteractiveDraft = (initialDraft: LevelUpDraft) => {
  const [draft, setDraft] = useState(initialDraft);

  const updateDraft = (updates: Partial<LevelUpDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  return { draft, updateDraft, setDraft };
};

export const StoryCharacterState: React.FC<{
  state: Partial<CharacterState>;
  children: React.ReactNode;
}> = ({ state, children }) => {
  const [isReady, setIsReady] = useState(false);

  const mergedState = useMemo(
    () => ({ ...BASELINE_CHARACTER_STATE, ...state }),
    [state],
  );

  useEffect(() => {
    useCharacterStore.setState(mergedState);
    setIsReady(true);
  }, [mergedState]);

  if (!isReady) return null;
  return <>{children}</>;
};

export const LevelUpStepStoryShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      width: "min(720px, 96vw)",
      margin: "1rem auto",
      padding: "1rem",
      border: "1px solid var(--color-panel-border, #333)",
      borderRadius: "0.75rem",
      background: "var(--color-bg-card, #1a1a1a)",
    }}
  >
    {children}
  </div>
);
