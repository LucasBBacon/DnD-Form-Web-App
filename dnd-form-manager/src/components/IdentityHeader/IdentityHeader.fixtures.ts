import type { LevelUpMode } from "../../types/progression";

export interface IdentityHeaderScenario {
  name: string;
  classNameDisplay: string;
  backgroundNameDisplay: string;
  playerName: string;
  raceNameDisplay: string;
  alignment: string;
  xp: number;
  levelUpMode: LevelUpMode;
}

export const IDENTITY_HEADER_FIXTURES: Record<string, IdentityHeaderScenario> = {
  newAdventurer: {
    name: "",
    classNameDisplay: "Choose Class",
    backgroundNameDisplay: "Choose Background",
    playerName: "",
    raceNameDisplay: "Choose Race",
    alignment: "",
    xp: 0,
    levelUpMode: "xp_gated",
  },
  fighterLevel5: {
    name: "Arannis Duskwhisper",
    classNameDisplay: "Fighter 5",
    backgroundNameDisplay: "Soldier",
    playerName: "Mira",
    raceNameDisplay: "Elf",
    alignment: "Neutral Good",
    xp: 7000,
    levelUpMode: "xp_gated",
  },
  milestoneCampaign: {
    name: "Sera Vale",
    classNameDisplay: "Wizard 9",
    backgroundNameDisplay: "Sage",
    playerName: "Jon",
    raceNameDisplay: "Human",
    alignment: "Chaotic Neutral",
    xp: 0,
    levelUpMode: "milestone_anytime",
  },
  multiclassHero: {
    name: "Kade Ironstep",
    classNameDisplay: "Fighter 6",
    backgroundNameDisplay: "Outlander",
    playerName: "Alex",
    raceNameDisplay: "Half-Orc",
    alignment: "Lawful Neutral",
    xp: 14000,
    levelUpMode: "xp_gated",
  },
  playground: {
    name: "Arannis Duskwhisper",
    classNameDisplay: "Fighter 5",
    backgroundNameDisplay: "Soldier",
    playerName: "Mira",
    raceNameDisplay: "Elf",
    alignment: "Neutral Good",
    xp: 7000,
    levelUpMode: "xp_gated",
  },
};
