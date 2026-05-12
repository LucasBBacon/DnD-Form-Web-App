import type {
  CharacterCreationWizardViewProps,
  WizardDraftAbilityRow,
  WizardDraftIdentityRow,
  WizardProgressCheck,
} from "./CharacterCreationWizardView";

export type CharacterCreationWizardScenario = Omit<
  CharacterCreationWizardViewProps,
  "onStepClick" | "isStepDisabled"
> & {
  disabledAfterStep: number;
};

const DEFAULT_STEPS: CharacterCreationWizardViewProps["steps"] = [
  { id: "race", label: "1. Race" },
  { id: "class", label: "2. Class" },
  { id: "spells", label: "3. Spells" },
  { id: "abilities", label: "4. Abilities" },
  { id: "background", label: "5. Background" },
  { id: "equipment", label: "6. Equipment" },
  { id: "identity", label: "7. Identity" },
];

const BASE_IDENTITY: WizardDraftIdentityRow[] = [
  { label: "Name", value: "Unknown" },
  { label: "Race", value: "..." },
  { label: "Subrace", value: "..." },
  { label: "Class", value: "..." },
  { label: "Subclass", value: "..." },
  { label: "Background", value: "..." },
  { label: "Level", value: "1" },
];

const BASE_ABILITIES: WizardDraftAbilityRow[] = [
  { label: "STR", score: 10, modifier: 0 },
  { label: "DEX", score: 10, modifier: 0 },
  { label: "CON", score: 10, modifier: 0 },
  { label: "INT", score: 10, modifier: 0 },
  { label: "WIS", score: 10, modifier: 0 },
  { label: "CHA", score: 10, modifier: 0 },
];

const BASE_PROGRESS: WizardProgressCheck[] = [
  { label: "Race", isComplete: false },
  { label: "Subrace", isComplete: false },
  { label: "Class", isComplete: false },
  { label: "Subclass", isComplete: false },
  { label: "Background", isComplete: false },
];

export const CHARACTER_CREATION_WIZARD_FIXTURES: Record<
  string,
  CharacterCreationWizardScenario
> = {
  freshStart: {
    brandTitle: "Character Creator",
    steps: DEFAULT_STEPS,
    currentStepIndex: 0,
    centerStage: "Choose your Race",
    disabledAfterStep: 0,
    draft: {
      identityRows: BASE_IDENTITY,
      proficiencyBonus: 2,
      abilities: BASE_ABILITIES,
      progressChecks: BASE_PROGRESS,
    },
  },
  classChosen: {
    brandTitle: "Character Creator",
    steps: DEFAULT_STEPS,
    currentStepIndex: 2,
    centerStage: "Pick your spells",
    disabledAfterStep: 2,
    draft: {
      identityRows: [
        { label: "Name", value: "Elaria" },
        { label: "Race", value: "Elf" },
        { label: "Subrace", value: "High Elf" },
        { label: "Class", value: "Wizard" },
        { label: "Subclass", value: "..." },
        { label: "Background", value: "Sage" },
        { label: "Level", value: "3" },
      ],
      proficiencyBonus: 2,
      abilities: [
        { label: "STR", score: 8, modifier: -1 },
        { label: "DEX", score: 14, modifier: 2 },
        { label: "CON", score: 13, modifier: 1 },
        { label: "INT", score: 16, modifier: 3 },
        { label: "WIS", score: 12, modifier: 1 },
        { label: "CHA", score: 10, modifier: 0 },
      ],
      progressChecks: [
        { label: "Race", isComplete: true },
        { label: "Subrace", isComplete: true },
        { label: "Class", isComplete: true },
        { label: "Subclass", isComplete: false },
        { label: "Background", isComplete: true },
        { label: "Choose 2 class skills", isComplete: true },
      ],
    },
  },
  blockedFinish: {
    brandTitle: "Character Creator",
    steps: DEFAULT_STEPS,
    currentStepIndex: 6,
    centerStage: "Final details are incomplete",
    disabledAfterStep: 6,
    draft: {
      identityRows: [
        { label: "Name", value: "Thorn" },
        { label: "Race", value: "Human" },
        { label: "Subrace", value: "..." },
        { label: "Class", value: "Cleric" },
        { label: "Subclass", value: "Life Domain" },
        { label: "Background", value: "Acolyte" },
        { label: "Level", value: "5" },
      ],
      proficiencyBonus: 3,
      abilities: [
        { label: "STR", score: 12, modifier: 1 },
        { label: "DEX", score: 10, modifier: 0 },
        { label: "CON", score: 14, modifier: 2 },
        { label: "INT", score: 10, modifier: 0 },
        { label: "WIS", score: 16, modifier: 3 },
        { label: "CHA", score: 13, modifier: 1 },
      ],
      progressChecks: [
        { label: "Race", isComplete: true },
        { label: "Subrace", isComplete: true },
        { label: "Class", isComplete: true },
        { label: "Subclass", isComplete: true },
        { label: "Background", isComplete: true },
        { label: "Prepare spells", isComplete: false },
      ],
    },
  },
};
