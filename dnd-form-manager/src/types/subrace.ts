export interface SubraceData {
  id: string; // e.g., 'subrace_elf_high'
  name: string; // e.g., 'High Elf'
  parentRaceId: string; // e.g., 'race_elf'

  traitsAdded?: string[]; // Trait IDs

  // Lore and flavor text for the subrace
  lore: {
    shortDescription: string;
    fullText?: string;
    sections?: Array<{ title: string; body: string }>;
  };
}
