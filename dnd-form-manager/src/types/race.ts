export interface Race {
  /** Unique identifier for the race */
  id: string;
  /** Name of the race */
  name: string;
  /** Description of the race */
  description?: string;
  /** Traits associated with the race */
  traits?: string[]; // Trait IDs
  /** Information about the subrace, if applicable */
  subraceInfo: {
    displayLabel?: string;
  } | null;
  /** Lore information for the race */
  lore: {
    /** Short description of the race */
    shortDescription: string;
    /** Full text description of the race */
    fullText?: string;
    /** Sections of the lore, each with a title and body */
    sections?: Array<{ title: string; body: string }>;
  };
}
