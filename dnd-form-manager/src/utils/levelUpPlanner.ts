import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { ClassData } from "../types/class";
import type { LevelUpDraft, LevelUpStepId } from "../types/levelUpDraft";
import type { LevelChoice } from "../types/progression";
import type { SubclassData } from "../types/subclass";
import type { PendingFeatureChoice, PendingProficiencyChoice } from "./choiceUtils";
import { getPendingFeatureChoices, getPendingProficiencyChoices } from "./choiceUtils";
import { getLevelUpRequirements, type LevelUpRequirements } from "./levelUpUtils";

const getSelectionKey = (choice: PendingProficiencyChoice): string =>
  `${choice.category}:${choice.sourceId}`;

const getChoicePool = (choice: PendingProficiencyChoice): string[] =>
  [...choice.pool];

export interface LevelUpPlannerContext {
  /** Total character level after this level-up (e.g. 6 when leveling 5→6). */
  targetTotalLevel: number;
  raceId: string | null;
  subraceId: string | null;
  /** Class data for the class being leveled. */
  classData: ClassData | null;
  /** Subclass data (current + newly picked). */
  subclassData: SubclassData | null;
  /** Class-specific level after this level-up. */
  classLevel: number;
  choicesByLevel: Record<number, LevelChoice>;
  classTracks: CharacterClassTrack[];
  draft: LevelUpDraft;
}

export interface LevelUpPlannerResult {
  /** Ordered list of step IDs the wizard should present. */
  orderedSteps: LevelUpStepId[];
  requirements: LevelUpRequirements;
  pendingProficiencyChoices: PendingProficiencyChoice[];
  pendingFeatureChoices: PendingFeatureChoice[];
  isComplete: boolean;
  completionErrors: string[];
}

/**
 * Derives the required wizard steps and completion status for a given level-up.
 *
 * The result is recomputed whenever the draft changes so the modal can gate
 * the "Confirm" button on full completion.
 */
export const buildLevelUpPlan = (ctx: LevelUpPlannerContext): LevelUpPlannerResult => {
  const {
    targetTotalLevel,
    raceId,
    subraceId,
    classData,
    subclassData,
    classLevel,
    choicesByLevel,
    classTracks,
    draft,
  } = ctx;

  const requirements = getLevelUpRequirements(
    targetTotalLevel,
    raceId,
    subraceId,
    classData,
    subclassData,
    classLevel,
    choicesByLevel,
    classTracks,
  );

  const pendingProficiencyChoices: PendingProficiencyChoice[] = classData
    ? getPendingProficiencyChoices(
        targetTotalLevel,
        raceId,
        subraceId,
        classData.id,
        subclassData?.id ?? null,
        choicesByLevel,
        classTracks,
      )
    : [];

  const pendingFeatureChoices: PendingFeatureChoice[] = classData
    ? getPendingFeatureChoices(
        targetTotalLevel,
        raceId,
        subraceId,
        classData.id,
        subclassData?.id ?? null,
        choicesByLevel,
        classTracks,
      )
    : [];

  // Build the ordered step sequence for this level-up
  const orderedSteps: LevelUpStepId[] = ["class_pick"];
  if (requirements.requiresSubclass) orderedSteps.push("subclass_pick");
  orderedSteps.push("hp_gain");
  if (requirements.requiresProficiencySelection) orderedSteps.push("proficiency_choice");
  if (requirements.requiresAsiOrFeat) orderedSteps.push("asi_or_feat");
  if (requirements.newCantripsToLearn > 0 || requirements.newSpellsToLearn > 0) {
    orderedSteps.push("spell_choice");
  }
  if (pendingFeatureChoices.length > 0) {
    orderedSteps.push("feature_choice");
  }
  orderedSteps.push("review");

  // Determine completion
  const completionErrors: string[] = [];

  if (!draft.targetClassId) {
    completionErrors.push("No class selected.");
  }

  if (requirements.requiresSubclass && !draft.newSubclassId) {
    completionErrors.push("Subclass selection required.");
  }

  if (draft.hpGained === null) {
    completionErrors.push("HP gain not determined.");
  }

  if (requirements.requiresProficiencySelection) {
    pendingProficiencyChoices.forEach((choice) => {
      const key = getSelectionKey(choice);
      const selected = draft.proficiencySelectionsBySource[key] ?? [];
      const pool = getChoicePool(choice);

      if (selected.length !== choice.count) {
        const delta = Math.abs(choice.count - selected.length);
        completionErrors.push(`${choice.sourceName}: select ${delta} more selection(s).`);
      }

      if (pool.length > 0) {
        const invalid = selected.find((item) => !pool.includes(item));
        if (invalid) {
          completionErrors.push(`${choice.sourceName}: invalid selection ${invalid}.`);
        }
      }
    });

    if (new Set(draft.skillChoices).size !== draft.skillChoices.length) {
      completionErrors.push("Duplicate skill selections are not allowed.");
    }
    if (new Set(draft.weaponChoices).size !== draft.weaponChoices.length) {
      completionErrors.push("Duplicate weapon selections are not allowed.");
    }
    if (new Set(draft.toolChoices).size !== draft.toolChoices.length) {
      completionErrors.push("Duplicate tool selections are not allowed.");
    }
    if (new Set(draft.languageChoices).size !== draft.languageChoices.length) {
      completionErrors.push("Duplicate language selections are not allowed.");
    }
  }

  if (requirements.requiresAsiOrFeat) {
    const totalAsiPoints = Object.values(draft.asiChoices).reduce(
      (sum, v) => sum + (v ?? 0),
      0,
    );
    if (!draft.featId && totalAsiPoints !== 2) {
      completionErrors.push("Assign 2 ability score points or choose a feat.");
    }
  }

  if (requirements.newSpellsToLearn > 0) {
    const deficit = requirements.newSpellsToLearn - draft.spellsLearned.length;
    if (deficit > 0) {
      completionErrors.push(`Select ${deficit} more spell(s) to learn.`);
    }
    if (new Set(draft.spellsLearned).size !== draft.spellsLearned.length) {
      completionErrors.push("Duplicate spell selections are not allowed.");
    }
  }

  if (requirements.newCantripsToLearn > 0) {
    const deficit = requirements.newCantripsToLearn - draft.cantripsLearned.length;
    if (deficit > 0) {
      completionErrors.push(`Select ${deficit} more cantrip(s) to learn.`);
    }
    if (new Set(draft.cantripsLearned).size !== draft.cantripsLearned.length) {
      completionErrors.push("Duplicate cantrip selections are not allowed.");
    }
  }

  pendingFeatureChoices.forEach((choice) => {
    if (choice.count !== 1) {
      completionErrors.push(
        `${choice.sourceName}: only single-value custom choices are currently supported.`,
      );
      return;
    }

    const selectedValue = (draft.featureChoices[choice.sourceId] ?? "").trim();
    if (!selectedValue) {
      completionErrors.push(`${choice.sourceName}: select a feature option.`);
      return;
    }

    if (choice.pool.length > 0 && !choice.pool.includes(selectedValue)) {
      completionErrors.push(
        `${choice.sourceName}: invalid feature option ${selectedValue}.`,
      );
    }
  });

  return {
    orderedSteps,
    requirements,
    pendingProficiencyChoices,
    pendingFeatureChoices,
    isComplete: completionErrors.length === 0,
    completionErrors,
  };
};
