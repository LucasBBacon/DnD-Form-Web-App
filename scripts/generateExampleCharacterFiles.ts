import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASELINE_CHARACTER_STATE } from "../src/store/useCharacterStore";
import { serializeCharacter } from "../src/store/characterPersistence";
import { SCENARIO_OVERRIDES } from "../src/dev/characterScenarios";
import type { CharacterState } from "../src/store/useCharacterStore";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, "..");
const outputDirectory = resolve(repoRoot, "public", "example-saves");

const createSaveFile = (override: Partial<CharacterState>): string =>
  serializeCharacter({
    ...BASELINE_CHARACTER_STATE,
    ...override,
  });

const exampleFiles = [
  {
    fileName: "creation-in-progress.dnd5e.json",
    content: createSaveFile({
      name: "Test Character",
      playerName: "Dev",
      isSetupComplete: false,
      raceId: "race_human",
      classId: "class_fighter",
      classTracks: [{ classId: "class_fighter", subclassId: null, level: 1 }],
      level: 1,
      alignment: "Neutral Good",
      baseAbilityScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      hpRolls: { 1: 10 },
      choicesByLevel: { 1: { hpGained: 10 } },
    }),
  },
  {
    fileName: "fighter-l1.dnd5e.json",
    content: createSaveFile(SCENARIO_OVERRIDES.fighter_l1 ?? {}),
  },
  {
    fileName: "wizard-l12.dnd5e.json",
    content: createSaveFile(SCENARIO_OVERRIDES.wizard_l12 ?? {}),
  },
  {
    fileName: "fighter-rogue-multiclass.dnd5e.json",
    content: createSaveFile(SCENARIO_OVERRIDES.fighter_rogue_mc ?? {}),
  },
  {
    fileName: "near-death.dnd5e.json",
    content: createSaveFile(SCENARIO_OVERRIDES.near_death ?? {}),
  },
] as const;

mkdirSync(outputDirectory, { recursive: true });

for (const exampleFile of exampleFiles) {
  const outputPath = resolve(outputDirectory, exampleFile.fileName);
  writeFileSync(outputPath, `${exampleFile.content}\n`, "utf8");
}

console.log(`Wrote ${exampleFiles.length} example save files to ${outputDirectory}`);