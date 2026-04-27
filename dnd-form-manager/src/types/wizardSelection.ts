export interface TraitSegment {
  name: string;
  shortDescription: string;
  fullDescription: string;
  source?: "base" | "sub";
  isOverride?: boolean;
}

export interface SubSelectionOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  traits: TraitSegment[];
}

export interface SelectionOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  traits: TraitSegment[];
  subOptions?: SubSelectionOption[];
  subOptionLabel?: string;
}
