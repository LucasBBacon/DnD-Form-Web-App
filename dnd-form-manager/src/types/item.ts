import type { UUID } from "./common";

export type ItemType = "gear" | "weapon" | "armor" | "tool" | "magic_item";

export type WeaponCategory =
  | "simple_melee"
  | "martial_melee"
  | "simple_ranged"
  | "martial_ranged";
export type WeaponProperty =
  | "finesse"
  | "light"
  | "heavy"
  | "two-handed"
  | "thrown"
  | "ammunition"
  | "versatile"
  | "reach"
  | "loading";
export type ItemStackMode = "stack" | "instance";

export interface ArmorProperties {
  /** Type of armor e.g., "light", "medium", "heavy", "shield" */
  armorType: "light" | "medium" | "heavy" | "shield";
  /** Base armor class provided by the armor */
  baseAc: number;
  /** Whether the armor imposes disadvantage on stealth checks */
  stealthDisadvantage: boolean;
  /** Minimum strength required to wear the armor effectively */
  strengthRequirement?: number;
}

export interface WeaponProperties {
  /** Category of the weapon e.g., "simple_melee", "martial_melee" */
  category: WeaponCategory;
  /** Damage dice of the weapon e.g., "1d8" */
  damageDice: string;
  /** Damage dice when using the weapon in versatile mode e.g., "1d10" */
  versatileDamageDice?: string;
  /** Type of damage dealt by the weapon e.g., "slashing", "piercing" */
  damageType: string;
  /** Properties of the weapon e.g., "finesse", "light" */
  properties: WeaponProperty[];
  /** Range of the weapon e.g., "5 ft", "150/600 ft" */
  range: string;
  /** ID of the item required to fire this weapon, if applicable */
  ammoItemId?: string;
}

export interface MagicItemProperties {
  /** Bonus to attack rolls provided by the magic item */
  bonusToAttack?: number;
  /** Bonus to damage rolls provided by the magic item */
  bonusToDamage?: number;
  /** Bonus to armor class provided by the magic item */
  bonusToAc?: number;
  /** Whether the magic item requires attunement */
  requiresAttunement: boolean;
}

export interface ItemStackingRules {
  /** Mode of item stacking e.g., "stack" or "instance" */
  mode: ItemStackMode;
  /** Number of items in a single stack */
  bundleSize?: number;
  /** Maximum number of stacks allowed */
  maxBundleCount?: number;
}

export interface ItemInstanceOverrides {
  /** Custom name for the item instance */
  name?: string;
  /** Custom weight for the item instance */
  weight?: number;
  /** Custom armor properties for the item instance */
  armorProperties?: ArmorProperties;
  /** Custom weapon properties for the item instance */
  weaponProperties?: WeaponProperties;
  /** Custom magic item properties for the item instance */
  magicItemProperties?: MagicItemProperties;
}

export interface ItemInstanceData {
  /** Unique identifier for the item instance */
  instanceId: UUID;
  /** ID of the base item this instance is derived from */
  baseItemId: string;
  /** Custom name for the item instance */
  customName?: string;
  /** Notes associated with the item instance */
  notes?: string;
  /** Tags associated with the item instance */
  tags?: string[];
  /** Overrides for the item instance */
  overrides?: ItemInstanceOverrides;
  /** ID of the catalog base item this instance was created from */
  createdFromCatalogBaseItemId?: string;
  /** Whether the item instance is custom */
  isCustom?: boolean;
}

export interface ItemData {
  /** Unique identifier for the item */
  id: string;
  /** Name of the item */
  name: string;
  /** Type of the item */
  type: ItemType;
  /** Weight of the item in pounds */
  weight: number;

  /** Lore information for the item */
  lore: {
    /** Short description of the item */
    shortDescription: string;
    /** Full text description of the item */
    fullText?: string;
  };

  // Optional; only present if type === 'armor'
  armorProperties?: ArmorProperties;

  /** Weapon properties for the item */
  weaponProperties?: WeaponProperties;
  /** Magic item properties for the item */
  magicItemProperties?: MagicItemProperties;
  /** Stacking rules for the item */
  stacking?: ItemStackingRules;

  // TODO: add modifiers, etc
}

export interface ItemCategoryData {
  /** Unique identifier for the item category */
  id: string;
  /** Display name of the category */
  name: string;
  /** IDs of items that belong to this category */
  itemIds: string[];
}
