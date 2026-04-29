export interface Race {
  id: string;
  name: string;
  description?: string;
  traits?: string[]; // Trait IDs
  subraceInfo: {
    displayLabel?: string;
  } | null;
  lore: {
    shortDescription: string;
    fullText?: string;
    sections?: Array<{ title: string; body: string }>;
  };
}
