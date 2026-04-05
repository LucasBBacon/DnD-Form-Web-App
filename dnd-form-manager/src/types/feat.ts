import type { Ability } from "./common";

export type FeatCategory = "origin" | "general" | "epic_boon";

export type FeatAcquisitionSource = "origin" | "level_up";

export interface FeatAcquisitionEntry {
  featId: string;
  source: FeatAcquisitionSource;
  sourceLevel?: number;
  sourceId?: string;
}

export interface FeatPrerequisites {
  minimumLevel?: number;
  abilityMinimums?: Partial<Record<Ability, number>>;
  requiredFeatIds?: string[];
  requiredClassIds?: string[];
  requiredSubclassIds?: string[];
  requiredRaceIds?: string[];
  requiredSubraceIds?: string[];
  requiresSpellcasting?: boolean;
}

export interface FeatLoreSection {
  title: string;
  body: string;
}

export interface FeatData {
  id: string;
  name: string;
  category: FeatCategory;
  source?: string;
  repeatable?: boolean;
  prerequisites?: FeatPrerequisites;
  grantedTraits: string[];
  lore: {
    shortDescription: string;
    fullText?: string;
    sections?: FeatLoreSection[];
  };
  tags?: string[];
}
