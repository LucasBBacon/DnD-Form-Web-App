export interface TraitSegment {
  name: string;
  shortDescription: string;
  fullDescription: string;
}

export interface SelectionOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  traits: TraitSegment[];
}
