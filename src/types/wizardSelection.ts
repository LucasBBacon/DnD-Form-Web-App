export interface TraitSegment {
  /** Name of the trait segment */
  name: string;
  /** Short description of the trait segment */
  shortDescription: string;
  /** Full description of the trait segment */
  fullDescription: string;
  /** Source of the trait segment, either base or sub */
  source?: "base" | "sub";
  /** Indicates if this trait segment overrides another */
  isOverride?: boolean;
}

export interface SubSelectionOption {
  /** Unique identifier for the sub-selection option */
  id: string;
  /** Name of the sub-selection option */
  name: string;
  /** Tagline or brief description of the sub-selection option */
  tagline: string;
  /** Detailed description of the sub-selection option */
  description: string;
  /** Traits associated with the sub-selection option */
  traits: readonly TraitSegment[];
}

export interface SelectionOption {
  /** Unique identifier for the selection option */
  id: string;
  /** Name of the selection option */
  name: string;
  /** Tagline or brief description of the selection option */
  tagline: string;
  /** Detailed description of the selection option */
  description: string;
  /** Traits associated with the selection option */
  traits: readonly TraitSegment[];
  /** Sub-options available for the selection option */
  subOptions?: readonly SubSelectionOption[];
  /** Label for the sub-options */
  subOptionLabel?: string;
}
