import type { LevelUpMode } from "../../types/progression";

export interface IdentityHeaderScenario {
  /** The name of the character */
  name: string;
  /** The display name of the character's class */
  classNameDisplay: string;
  /** The display name of the character's background */
  backgroundNameDisplay: string;
  /** The name of the player controlling the character */
  playerName: string;
  /** The display name of the character's race */
  raceNameDisplay: string;
  /** The alignment of the character */
  alignment: string;
  /** The experience points of the character */
  xp: number;
  /** The level up mode of the character */
  levelUpMode: LevelUpMode;
}

export const IDENTITY_HEADER_FIXTURES: Record<string, IdentityHeaderScenario> =
  {
    newAdventurer: {
      name: "",
      classNameDisplay: "Choose Class",
      backgroundNameDisplay: "Choose Background",
      playerName: "",
      raceNameDisplay: "Choose Race",
      alignment: "",
      xp: 0,
      levelUpMode: "xp",
    },
    fighterLevel5: {
      name: "Arannis Duskwhisper",
      classNameDisplay: "Fighter 5",
      backgroundNameDisplay: "Soldier",
      playerName: "Mira",
      raceNameDisplay: "Elf",
      alignment: "Neutral Good",
      xp: 7000,
      levelUpMode: "xp",
    },
    milestoneCampaign: {
      name: "Sera Vale",
      classNameDisplay: "Wizard 9",
      backgroundNameDisplay: "Sage",
      playerName: "Jon",
      raceNameDisplay: "Human",
      alignment: "Chaotic Neutral",
      xp: 0,
      levelUpMode: "milestone",
    },
    multiclassHero: {
      name: "Kade Ironstep",
      classNameDisplay: "Fighter 6",
      backgroundNameDisplay: "Outlander",
      playerName: "Alex",
      raceNameDisplay: "Half-Orc",
      alignment: "Lawful Neutral",
      xp: 14000,
      levelUpMode: "xp",
    },
    playground: {
      name: "Arannis Duskwhisper",
      classNameDisplay: "Fighter 5",
      backgroundNameDisplay: "Soldier",
      playerName: "Mira",
      raceNameDisplay: "Elf",
      alignment: "Neutral Good",
      xp: 7000,
      levelUpMode: "xp",
    },
  };
