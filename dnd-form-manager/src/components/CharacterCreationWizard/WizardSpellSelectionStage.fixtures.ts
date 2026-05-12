import type { WizardSpellSelectionStageViewProps } from "./WizardSpellSelectionStageView";
import type { WizardSpellOption } from "./WizardSpellSelectionStageView";

export type WizardSpellSelectionScenario = Omit<
  WizardSpellSelectionStageViewProps,
  "onCantripToggle" | "onSpellToggle"
>;

const SPELL_OPTIONS: WizardSpellOption[] = [
  { id: "spell_magic_missile", name: "Magic Missile", level: 1, school: "evocation" },
  { id: "spell_shield", name: "Shield", level: 1, school: "abjuration" },
  { id: "spell_detect_magic", name: "Detect Magic", level: 1, school: "divination" },
  { id: "spell_misty_step", name: "Misty Step", level: 2, school: "conjuration" },
];

const CANTRIP_OPTIONS: WizardSpellOption[] = [
  { id: "spell_light", name: "Light", level: 0, school: "evocation" },
  { id: "spell_mage_hand", name: "Mage Hand", level: 0, school: "conjuration" },
  { id: "spell_ray_of_frost", name: "Ray of Frost", level: 0, school: "evocation" },
];

export const WIZARD_SPELL_SELECTION_FIXTURES: Record<
  string,
  WizardSpellSelectionScenario
> = {
  classNotSelected: {
    classSelected: false,
    isSpellcaster: false,
    isPreparedCaster: false,
    cantrips: [],
    spells: [],
    bonusPreparedSpells: [],
    selectedCantripIds: [],
    selectedSpellIds: [],
    cantripMax: 0,
    spellMax: 0,
    spellCountLabel: "known",
  },
  nonSpellcasterClass: {
    classSelected: true,
    isSpellcaster: false,
    isPreparedCaster: false,
    cantrips: [],
    spells: [],
    bonusPreparedSpells: [],
    selectedCantripIds: [],
    selectedSpellIds: [],
    cantripMax: 0,
    spellMax: 0,
    spellCountLabel: "known",
  },
  preparedCaster: {
    classSelected: true,
    isSpellcaster: true,
    isPreparedCaster: true,
    cantrips: CANTRIP_OPTIONS,
    spells: SPELL_OPTIONS,
    bonusPreparedSpells: [],
    selectedCantripIds: ["spell_light", "spell_mage_hand"],
    selectedSpellIds: ["spell_magic_missile"],
    cantripMax: 3,
    spellMax: 4,
    spellCountLabel: "prepared",
  },
  knownCasterAtCap: {
    classSelected: true,
    isSpellcaster: true,
    isPreparedCaster: false,
    cantrips: CANTRIP_OPTIONS,
    spells: SPELL_OPTIONS,
    bonusPreparedSpells: [],
    selectedCantripIds: ["spell_light", "spell_mage_hand"],
    selectedSpellIds: ["spell_magic_missile", "spell_shield"],
    cantripMax: 2,
    spellMax: 2,
    spellCountLabel: "known",
  },
  withDomainSpells: {
    classSelected: true,
    isSpellcaster: true,
    isPreparedCaster: true,
    cantrips: CANTRIP_OPTIONS,
    spells: SPELL_OPTIONS,
    bonusPreparedSpells: [
      { id: "spell_bless", name: "Bless", level: 1, school: "enchantment" },
      { id: "spell_lesser_restoration", name: "Lesser Restoration", level: 2, school: "abjuration" },
    ],
    selectedCantripIds: ["spell_light"],
    selectedSpellIds: ["spell_detect_magic"],
    cantripMax: 3,
    spellMax: 3,
    spellCountLabel: "prepared",
  },
};
