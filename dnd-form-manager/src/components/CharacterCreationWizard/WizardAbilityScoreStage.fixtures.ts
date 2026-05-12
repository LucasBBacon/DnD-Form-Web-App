import type { Ability } from "../../types/common";
import type {
  PointBuyValidationResult,
  VirtualAbilityRoll,
} from "../../utils/abilityAssignmentUtils";
import type {
  AbilityScoreOptionPool,
  WizardAbilityScoreStageViewProps,
} from "./WizardAbilityScoreStageView";

export type WizardAbilityScoreScenario = Omit<
  WizardAbilityScoreStageViewProps,
  | "onMethodChange"
  | "onRollModeChange"
  | "onStandardArrayChange"
  | "onPointBuyInput"
  | "onPointBuyOverrideChange"
  | "onVirtualRollComplete"
  | "onRerollAll"
  | "onVirtualAssignmentChange"
  | "onConfirm"
  | "onContinue"
>;

const baseScoresDefault: Record<Ability, number> = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

const pointBuyNeutral: PointBuyValidationResult = {
  totalCost: 12,
  isInRange: true,
  isStrictlyValid: true,
  overBudgetBy: 0,
};

const noPools: AbilityScoreOptionPool[] = [];
const noRolls: VirtualAbilityRoll[] = [];

export const WIZARD_ABILITY_SCORE_FIXTURES: Record<
  string,
  WizardAbilityScoreScenario
> = {
  standardArrayValid: {
    method: "standard_array",
    rollingMode: "virtual",
    pointBuyOverride: false,
    baseScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    completed: true,
    virtualRolls: noRolls,
    virtualAssignments: {},
    virtualScorePools: noPools,
    pointBuy: pointBuyNeutral,
    isVirtualValid: false,
    isPhysicalValid: true,
    isStandardArrayValid: true,
    isPointBuyComplete: true,
    canContinue: true,
    error: null,
  },
  pointBuyInvalidNeedsOverride: {
    method: "point_buy",
    rollingMode: "virtual",
    pointBuyOverride: false,
    baseScores: { str: 15, dex: 15, con: 15, int: 15, wis: 8, cha: 8 },
    completed: false,
    virtualRolls: noRolls,
    virtualAssignments: {},
    virtualScorePools: noPools,
    pointBuy: {
      totalCost: 36,
      isInRange: true,
      isStrictlyValid: false,
      overBudgetBy: 9,
    },
    isVirtualValid: false,
    isPhysicalValid: true,
    isStandardArrayValid: false,
    isPointBuyComplete: false,
    canContinue: false,
    error: "Point buy is invalid. Fix values or enable override to continue.",
  },
  rollingVirtualInProgress: {
    method: "rolling",
    rollingMode: "virtual",
    pointBuyOverride: false,
    baseScores: baseScoresDefault,
    completed: false,
    virtualRolls: [
      { dice: [6, 5, 4, 2], dropped: 2, kept: [4, 5, 6], total: 15 },
      { dice: [6, 6, 3, 1], dropped: 1, kept: [3, 6, 6], total: 15 },
      { dice: [5, 4, 3, 2], dropped: 2, kept: [3, 4, 5], total: 12 },
    ],
    virtualAssignments: { str: 15, dex: 12 },
    virtualScorePools: [
      { score: 15, available: 2, used: 1 },
      { score: 12, available: 1, used: 1 },
    ],
    pointBuy: pointBuyNeutral,
    isVirtualValid: false,
    isPhysicalValid: true,
    isStandardArrayValid: false,
    isPointBuyComplete: true,
    canContinue: false,
    error: null,
  },
  rollingPhysicalValid: {
    method: "rolling",
    rollingMode: "physical",
    pointBuyOverride: false,
    baseScores: { str: 17, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    completed: true,
    virtualRolls: noRolls,
    virtualAssignments: {},
    virtualScorePools: noPools,
    pointBuy: pointBuyNeutral,
    isVirtualValid: false,
    isPhysicalValid: true,
    isStandardArrayValid: false,
    isPointBuyComplete: true,
    canContinue: true,
    error: null,
  },
};
