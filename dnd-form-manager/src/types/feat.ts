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
  minimum_level?: number;
  ability_minimums?: Partial<Record<Ability, number>>;
  required_feat_ids?: string[];
  required_class_ids?: string[];
  required_subclass_ids?: string[];
  required_race_ids?: string[];
  required_subrace_ids?: string[];
  requires_spellcasting?: boolean;
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
  granted_traits: string[];
  lore: {
    short_description: string;
    full_text?: string;
    sections?: FeatLoreSection[];
  };
  tags?: string[];
}