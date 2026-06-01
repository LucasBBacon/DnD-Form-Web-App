import type { SpellCastMetadata } from "../../hooks/useSpellcasting";

export interface SpellReferenceData {
  id: string;
  name: string;
  level: number;
  castingTime: string;
  range: string;
  components: {
    vocal: boolean;
    somatic: boolean;
    material: string | null;
  };
  duration: string;
  description: string;
  highLevelsText?: string;
}

export interface SpellbookEntry {
  reference: SpellReferenceData;
  metadata?: SpellCastMetadata;
  isPrepared: boolean;
  isKnown: boolean;
  isAlwaysPrepared: boolean;
}

export interface SpellFilterState {
  searchQuery: string;
  levels: Set<number>;
  schools: Set<string>;
  preparedOnly: boolean;
}