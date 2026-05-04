export interface SubraceData {
  /** Unique identifier for the subrace e.g., 'subrace_elf_high' */
  id: string;
  /** Name of the subrace e.g., 'High Elf' */
  name: string;
  /** Unique identifier for the parent race e.g., 'race_elf' */
  parentRaceId: string;

  /** Traits added by the subrace */
  traitsAdded?: string[]; // Trait IDs

  // Lore and flavor text for the subrace
  lore: {
    /** Short description of the subrace */
    shortDescription: string;
    /** Full text description of the subrace */
    fullText?: string;
    /** Additional sections of lore for the subrace */
    sections?: Array<{ title: string; body: string }>;
  };
}
