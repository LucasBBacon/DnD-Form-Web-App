import { VITALS_DASHBOARD_FIXTURES } from "./VitalsDashboard/VitalsDashboard.fixtures";
import { ACTIONS_BOARD_FIXTURES } from "./ActionsBoard/ActionsBoard.fixtures";
import { INVENTORY_BOARD_FIXTURES } from "./InventoryBoard/InventoryBoard.fixtures";
import { ROLEPLAY_BOARD_FIXTURES } from "./RoleplayBoard/RoleplayBoard.fixtures";
import { IDENTITY_HEADER_FIXTURES } from "./IdentityHeader/IdentityHeader.fixtures";
import { CORE_STATS_BOARD_FIXTURES } from "./CoreStatsBoard/CoreStatsBoard.fixtures";
import { SPELLBOOK_BOARD_FIXTURES } from "./SpellBookBoard/SpellBookBoard.fixtures";

export type CharacterSheetScenarioKey =
  | "balanced"
  | "combatPressure"
  | "treasureHaul"
  | "arcaneSpecialist";

interface CharacterSheetScenarioRefs {
  label: string;
  identity: keyof typeof IDENTITY_HEADER_FIXTURES;
  stats: keyof typeof CORE_STATS_BOARD_FIXTURES;
  vitals: keyof typeof VITALS_DASHBOARD_FIXTURES;
  actions: keyof typeof ACTIONS_BOARD_FIXTURES;
  inventory: keyof typeof INVENTORY_BOARD_FIXTURES;
  roleplay: keyof typeof ROLEPLAY_BOARD_FIXTURES;
  spellbook: keyof typeof SPELLBOOK_BOARD_FIXTURES;
}

export const CHARACTER_SHEET_SCENARIO_REFS: Record<
  CharacterSheetScenarioKey,
  CharacterSheetScenarioRefs
> = {
  balanced: {
    label: "Balanced Adventurer",
    identity: "fighterLevel5",
    stats: "balanced",
    vitals: "healthy",
    actions: "allActions",
    inventory: "standardLoadout",
    roleplay: "featuresLoaded",
    spellbook: "preparedCaster",
  },
  combatPressure: {
    label: "Combat Pressure",
    identity: "multiclassHero",
    stats: "pressured",
    vitals: "critical",
    actions: "withRollResults",
    inventory: "encumbered",
    roleplay: "characteristicsFilled",
    spellbook: "armorBlocked",
  },
  treasureHaul: {
    label: "Treasure Haul",
    identity: "fighterLevel5",
    stats: "balanced",
    vitals: "bloodied",
    actions: "withAttacks",
    inventory: "playground",
    roleplay: "biographyDetailed",
    spellbook: "withInnateSpells",
  },
  arcaneSpecialist: {
    label: "Arcane Specialist",
    identity: "milestoneCampaign",
    stats: "specialist",
    vitals: "withTempHp",
    actions: "withSpells",
    inventory: "fullyAttuned",
    roleplay: "featuresLoaded",
    spellbook: "pactCaster",
  },
};

export const resolveCharacterSheetScenario = (key: CharacterSheetScenarioKey) => {
  const refs = CHARACTER_SHEET_SCENARIO_REFS[key];

  return {
    key,
    label: refs.label,
    identity: IDENTITY_HEADER_FIXTURES[refs.identity],
    stats: CORE_STATS_BOARD_FIXTURES[refs.stats],
    vitals: VITALS_DASHBOARD_FIXTURES[refs.vitals],
    actions: ACTIONS_BOARD_FIXTURES[refs.actions],
    inventory: INVENTORY_BOARD_FIXTURES[refs.inventory],
    roleplay: ROLEPLAY_BOARD_FIXTURES[refs.roleplay],
    spellbook: SPELLBOOK_BOARD_FIXTURES[refs.spellbook],
  };
};
