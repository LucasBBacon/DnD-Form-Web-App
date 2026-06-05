import type { CharacterState } from "../store/useCharacterStore";

export type SavedCharacterData = Omit<
  CharacterState,
  "levelUpModalState" | "restModalState"
>;

export interface SavedCharacterFile {
  schemaVersion: string;
  savedAt: string;
  appVersion: string;
  character: SavedCharacterData;
}