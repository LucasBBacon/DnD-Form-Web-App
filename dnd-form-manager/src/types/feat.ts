import type { Ability } from "./common";

export type FeatCategory = "origin" | "general" | "epic_boon";

export type FeatAcquisitionSource = "origin" | "level_up";

export interface FeatAcquisitionEntry {
  /** ID of the feat being acquired */
  featId: string;
  /** Source of the feat acquisition */
  source: FeatAcquisitionSource;
  /** Level at which the feat is acquired, if applicable */
  sourceLevel?: number;
  /** ID of the source feature or ability granting the feat, if applicable */
  sourceId?: string;
}

export interface FeatPrerequisites {
  /** Minimum character level required for the feat */
  minimumLevel?: number;
  /** Minimum ability scores required for the feat */
  abilityMinimums?: Partial<Record<Ability, number>>;
  /** IDs of feats required as prerequisites */
  requiredFeatIds?: string[];
  /** IDs of classes required as prerequisites */
  requiredClassIds?: string[];
  /** IDs of subclasses required as prerequisites */
  requiredSubclassIds?: string[];
  /** IDs of races required as prerequisites */
  requiredRaceIds?: string[];
  /** IDs of subraces required as prerequisites */
  requiredSubraceIds?: string[];
  /** Whether spellcasting is required as a prerequisite */
  requiresSpellcasting?: boolean;
}

export interface FeatLoreSection {
  /** Title of the lore section */
  title: string;
  /** Body text of the lore section */
  body: string;
}

export interface FeatData {
  /** ID of the feat */
  id: string;
  /** Name of the feat */
  name: string;
  /** Category of the feat e.g., "origin", "general", "epic_boon" */
  category: FeatCategory;
  /** Source of the feat, if applicable */
  source?: string;
  /** Whether the feat can be taken multiple times */
  repeatable?: boolean;
  /** Prerequisites required for the feat */
  prerequisites?: FeatPrerequisites;
  /** Traits granted by the feat */
  grantedTraits: string[];
  /** Lore information about the feat */
  lore: {
    /** Short description of the feat */
    shortDescription: string;
    /** Full text description of the feat */
    fullText?: string;
    /** Sections of lore related to the feat */
    sections?: FeatLoreSection[];
  };
  /** Tags associated with the feat */
  tags?: string[];
}
