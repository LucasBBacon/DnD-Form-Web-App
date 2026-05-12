import { CHARACTER_CREATION_WIZARD_FIXTURES } from "./CharacterCreationWizard.fixtures";
import { WIZARD_SPELL_SELECTION_FIXTURES } from "./WizardSpellSelectionStage.fixtures";
import { WIZARD_ABILITY_SCORE_FIXTURES } from "./WizardAbilityScoreStage.fixtures";
import { WIZARD_EQUIPMENT_SELECTION_FIXTURES } from "./WizardEquipmentSelectionStage.fixtures";

export const WIZARD_SELECTION_STAGE_COMPOSED_FIXTURES = {
  raceChooser: {
    title: "Race",
    currentSelectionId: null,
    currentSubSelectionId: null,
    expandedBaseId: null,
    expandedSubId: null,
    expandedTraitIndex: null,
    options: [
      {
        id: "race_elf",
        name: "Elf",
        tagline: "Graceful and keen-sensed",
        description: "Elves are a magical people of otherworldly grace.",
        traits: [
          {
            name: "Darkvision",
            shortDescription: "See in dim light and darkness.",
            fullDescription:
              "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions.",
          },
        ],
        subOptionLabel: "Subrace",
        subOptions: [
          {
            id: "subrace_high_elf",
            name: "High Elf",
            tagline: "Arcane inclined",
            description: "High Elves are scholarly and steeped in magic.",
            traits: [
              {
                name: "Cantrip",
                shortDescription: "Know one wizard cantrip.",
                fullDescription:
                  "You know one cantrip of your choice from the wizard spell list.",
              },
            ],
          },
        ],
      },
      {
        id: "race_human",
        name: "Human",
        tagline: "Versatile and determined",
        description: "Humans are adaptable and ambitious.",
        traits: [
          {
            name: "Resourceful",
            shortDescription: "Gain broad proficiencies.",
            fullDescription:
              "Your adaptability grants you a broad array of practical training.",
          },
        ],
      },
    ],
  },
  raceExpanded: {
    title: "Race",
    currentSelectionId: "race_elf",
    currentSubSelectionId: "subrace_high_elf",
    expandedBaseId: "race_elf",
    expandedSubId: "subrace_high_elf",
    expandedTraitIndex: 0,
    options: [
      {
        id: "race_elf",
        name: "Elf",
        tagline: "Graceful and keen-sensed",
        description: "Elves are a magical people of otherworldly grace.",
        traits: [
          {
            name: "Darkvision",
            shortDescription: "See in dim light and darkness.",
            fullDescription:
              "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions.",
          },
        ],
        subOptionLabel: "Subrace",
        subOptions: [
          {
            id: "subrace_high_elf",
            name: "High Elf",
            tagline: "Arcane inclined",
            description: "High Elves are scholarly and steeped in magic.",
            traits: [
              {
                name: "Cantrip",
                shortDescription: "Know one wizard cantrip.",
                fullDescription:
                  "You know one cantrip of your choice from the wizard spell list.",
              },
            ],
          },
        ],
      },
    ],
  },
} as const;

export type CharacterCreationComposedScenarioKey =
  | "raceStart"
  | "spellsPrepared"
  | "abilitiesPointBuy"
  | "equipmentChoices";

interface CharacterCreationComposedScenarioRefs {
  label: string;
  shell: keyof typeof CHARACTER_CREATION_WIZARD_FIXTURES;
  centerStage:
    | {
        kind: "selection";
        fixture: keyof typeof WIZARD_SELECTION_STAGE_COMPOSED_FIXTURES;
      }
    | {
        kind: "spells";
        fixture: keyof typeof WIZARD_SPELL_SELECTION_FIXTURES;
      }
    | {
        kind: "abilities";
        fixture: keyof typeof WIZARD_ABILITY_SCORE_FIXTURES;
      }
    | {
        kind: "equipment";
        fixture: keyof typeof WIZARD_EQUIPMENT_SELECTION_FIXTURES;
      };
}

export const CHARACTER_CREATION_COMPOSED_SCENARIO_REFS: Record<
  CharacterCreationComposedScenarioKey,
  CharacterCreationComposedScenarioRefs
> = {
  raceStart: {
    label: "Race Start",
    shell: "freshStart",
    centerStage: {
      kind: "selection",
      fixture: "raceChooser",
    },
  },
  spellsPrepared: {
    label: "Spells Prepared",
    shell: "classChosen",
    centerStage: {
      kind: "spells",
      fixture: "preparedCaster",
    },
  },
  abilitiesPointBuy: {
    label: "Abilities Point Buy",
    shell: "classChosen",
    centerStage: {
      kind: "abilities",
      fixture: "pointBuyInvalidNeedsOverride",
    },
  },
  equipmentChoices: {
    label: "Equipment Choices",
    shell: "blockedFinish",
    centerStage: {
      kind: "equipment",
      fixture: "withChoicesIncomplete",
    },
  },
};

export const resolveCharacterCreationComposedScenario = (
  key: CharacterCreationComposedScenarioKey,
) => {
  const refs = CHARACTER_CREATION_COMPOSED_SCENARIO_REFS[key];

  return {
    key,
    label: refs.label,
    shell: CHARACTER_CREATION_WIZARD_FIXTURES[refs.shell],
    centerStage:
      refs.centerStage.kind === "selection"
        ? {
            kind: "selection" as const,
            fixture: WIZARD_SELECTION_STAGE_COMPOSED_FIXTURES[refs.centerStage.fixture],
          }
        : refs.centerStage.kind === "spells"
          ? {
              kind: "spells" as const,
              fixture: WIZARD_SPELL_SELECTION_FIXTURES[refs.centerStage.fixture],
            }
          : refs.centerStage.kind === "abilities"
            ? {
                kind: "abilities" as const,
                fixture: WIZARD_ABILITY_SCORE_FIXTURES[refs.centerStage.fixture],
              }
            : {
                kind: "equipment" as const,
                fixture: WIZARD_EQUIPMENT_SELECTION_FIXTURES[refs.centerStage.fixture],
              },
  };
};
