import { ROLEPLAY_FIXTURES } from "../../fixtures/boardFixtures";
import type { RoleplayFeature, RoleplayTab } from "./RoleplayBoardView";

export interface RoleplayBoardScenario {
  activeTab: RoleplayTab;
  features: RoleplayFeature[];
  characteristics: {
    personalityTraits: string;
    ideals: string;
    bonds: string;
    flaws: string;
  };
  biography: {
    age: string;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
    appearance: string;
    backstory: string;
    alliesAndOrganizations: string;
  };
}

const FEATURE_SET_HEROIC: RoleplayFeature[] = [
  {
    id: "trait-darkvision",
    name: "Darkvision",
    description: "Can see in dim light as if it were bright light.",
    sources: [
      {
        key: "trait-darkvision-race",
        kind: "race",
        label: "Elf",
      },
    ],
  },
  {
    id: "trait-action-surge",
    name: "Action Surge",
    description: "Take one additional action on your turn once per rest.",
    sources: [
      {
        key: "trait-action-surge-class",
        kind: "class",
        label: "Fighter level 2",
      },
    ],
  },
];

const FEATURE_SET_MIXED: RoleplayFeature[] = [
  {
    id: "trait-darkvision",
    name: "Darkvision",
    description: "Can see in dim light as if it were bright light.",
    sources: [
      {
        key: "trait-darkvision-race",
        kind: "race",
        label: "Elf",
      },
      {
        key: "trait-darkvision-feat",
        kind: "feat",
        label: "Feat: Shadow Touched",
      },
    ],
  },
];

export const ROLEPLAY_BOARD_FIXTURES: Record<string, RoleplayBoardScenario> = {
  featuresEmpty: {
    activeTab: "features",
    features: [],
    characteristics: {
      personalityTraits: ROLEPLAY_FIXTURES.blank.personality,
      ideals: ROLEPLAY_FIXTURES.blank.ideals,
      bonds: ROLEPLAY_FIXTURES.blank.bonds,
      flaws: ROLEPLAY_FIXTURES.blank.flaws,
    },
    biography: {
      age: "",
      height: "",
      weight: "",
      eyes: "",
      skin: "",
      hair: "",
      appearance: "",
      backstory: ROLEPLAY_FIXTURES.blank.backstory,
      alliesAndOrganizations: "",
    },
  },
  featuresLoaded: {
    activeTab: "features",
    features: FEATURE_SET_HEROIC,
    characteristics: {
      personalityTraits: ROLEPLAY_FIXTURES.heroic.personality,
      ideals: ROLEPLAY_FIXTURES.heroic.ideals,
      bonds: ROLEPLAY_FIXTURES.heroic.bonds,
      flaws: ROLEPLAY_FIXTURES.heroic.flaws,
    },
    biography: {
      age: "127",
      height: "5'10\"",
      weight: "148 lb",
      eyes: "Silver",
      skin: "Pale bronze",
      hair: "Dark brown",
      appearance: "Keeps armor polished and travel cloak immaculate.",
      backstory: ROLEPLAY_FIXTURES.heroic.backstory,
      alliesAndOrganizations: "Silverwood Wardens",
    },
  },
  characteristicsFilled: {
    activeTab: "characteristics",
    features: FEATURE_SET_HEROIC,
    characteristics: {
      personalityTraits: ROLEPLAY_FIXTURES.haunted.personality,
      ideals: ROLEPLAY_FIXTURES.haunted.ideals,
      bonds: ROLEPLAY_FIXTURES.haunted.bonds,
      flaws: ROLEPLAY_FIXTURES.haunted.flaws,
    },
    biography: {
      age: "31",
      height: "5'6\"",
      weight: "132 lb",
      eyes: "Grey",
      skin: "Olive",
      hair: "Black",
      appearance: "Wears a hooded coat lined with ritual sigils.",
      backstory: ROLEPLAY_FIXTURES.haunted.backstory,
      alliesAndOrganizations: "Nocturne Vigil",
    },
  },
  biographyDetailed: {
    activeTab: "biography",
    features: FEATURE_SET_MIXED,
    characteristics: {
      personalityTraits: ROLEPLAY_FIXTURES.haunted.personality,
      ideals: ROLEPLAY_FIXTURES.haunted.ideals,
      bonds: ROLEPLAY_FIXTURES.haunted.bonds,
      flaws: ROLEPLAY_FIXTURES.haunted.flaws,
    },
    biography: {
      age: "31",
      height: "5'6\"",
      weight: "132 lb",
      eyes: "Grey",
      skin: "Olive",
      hair: "Black",
      appearance: "A faded rune scars her left palm.",
      backstory: ROLEPLAY_FIXTURES.haunted.backstory,
      alliesAndOrganizations: "Nocturne Vigil, Cinder Alley informants",
    },
  },
  spellbookTab: {
    activeTab: "spellbook",
    features: FEATURE_SET_HEROIC,
    characteristics: {
      personalityTraits: ROLEPLAY_FIXTURES.heroic.personality,
      ideals: ROLEPLAY_FIXTURES.heroic.ideals,
      bonds: ROLEPLAY_FIXTURES.heroic.bonds,
      flaws: ROLEPLAY_FIXTURES.heroic.flaws,
    },
    biography: {
      age: "127",
      height: "5'10\"",
      weight: "148 lb",
      eyes: "Silver",
      skin: "Pale bronze",
      hair: "Dark brown",
      appearance: "Keeps armor polished and travel cloak immaculate.",
      backstory: ROLEPLAY_FIXTURES.heroic.backstory,
      alliesAndOrganizations: "Silverwood Wardens",
    },
  },
  playground: {
    activeTab: "features",
    features: FEATURE_SET_HEROIC,
    characteristics: {
      personalityTraits: ROLEPLAY_FIXTURES.heroic.personality,
      ideals: ROLEPLAY_FIXTURES.heroic.ideals,
      bonds: ROLEPLAY_FIXTURES.heroic.bonds,
      flaws: ROLEPLAY_FIXTURES.heroic.flaws,
    },
    biography: {
      age: "127",
      height: "5'10\"",
      weight: "148 lb",
      eyes: "Silver",
      skin: "Pale bronze",
      hair: "Dark brown",
      appearance: "Keeps armor polished and travel cloak immaculate.",
      backstory: ROLEPLAY_FIXTURES.heroic.backstory,
      alliesAndOrganizations: "Silverwood Wardens",
    },
  },
};
