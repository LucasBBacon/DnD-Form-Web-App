import type { UUID } from "./common";

export type ItemType = "gear" | "weapon" | "armor" | "tool" | "magic_item";

export type WeaponCategory =
  | "simple_melee"
  | "martial_melee"
  | "simple_ranged"
  | "martial_ranged";
export type WeaponPropertyId =
  | "property_ammunition"
  | "property_finesse"
  | "property_heavy"
  | "property_light"
  | "property_loading"
  | "property_range"
  | "property_reach"
  | "property_special"
  | "property_thrown"
  | "property_two_handed"
  | "property_versatile";

export interface WeaponPropertyCatalogEntry {
  id: WeaponPropertyId;
  name: string;
  lore: {
    shortDescription: string;
    fullText: string;
  };
}

export interface WeaponRangeBand {
  /** Normal range in feet. */
  normal: number;
  /** Long range in feet, when applicable. */
  long?: number;
}

export type WeaponAttackAbility = "str" | "dex" | "choice";

export interface WeaponRules {
  /** Governing attack ability for the weapon. */
  attackAbility: WeaponAttackAbility;
  /** Whether the weapon is a ranged weapon category. */
  isRangedWeapon: boolean;
  /** Reach in feet for melee attacks with this weapon. */
  meleeReachFeet: number;
  /** Parsed range band for ranged weapons. */
  range?: WeaponRangeBand;
  /** Parsed range band for thrown melee weapons. */
  thrownRange?: WeaponRangeBand;
  /** Whether the weapon requires ammunition. */
  requiresAmmunition: boolean;
  /** Whether the weapon has the loading property. */
  loading: boolean;
  /** Whether the weapon has the light property. */
  light: boolean;
  /** Whether the weapon has the heavy property. */
  heavy: boolean;
  /** Whether the weapon requires two hands. */
  twoHanded: boolean;
  /** Whether the weapon has the special property. */
  special: boolean;
  /** Whether the weapon has the finesse property. */
  finesse: boolean;
  /** Whether the weapon can be used with the versatile rule. */
  versatile: boolean;
}

export interface RawWeaponProperties {
  /** Category of the weapon e.g., "simple_melee" */
  category: WeaponCategory;
  /** Damage dice of the weapon e.g., "1d8" */
  damageDice: string;
  /** Damage dice when using the weapon in versatile mode e.g., "1d10" */
  versatileDamageDice?: string;
  /** Type of damage dealt by the weapon e.g., "slashing" */
  damageType: string;
  /** Raw weapon property ids. */
  properties: WeaponPropertyId[];
  /** Range of the weapon e.g., "5 ft", "150/600 ft" */
  range: string;
  /** ID of the item required as ammunition, if applicable */
  ammoItemId?: string;
}

export type ItemStackMode = "stack" | "instance";
export type ArmorAcApplication = "set" | "bonus";
export type ArmorDexModifierMode = "full" | "capped" | "none";

export interface ArmorDexModifier {
  /** How Dexterity modifier contributes to AC for this armor */
  mode: ArmorDexModifierMode;
  /** Dex cap applied when mode is capped */
  cap?: number;
}

export interface ArmorProperties {
  /** Whether this armor sets AC or grants AC as a bonus */
  acApplication: ArmorAcApplication;
  /** Type of armor e.g., "light", "medium", "heavy", "shield" */
  armorType: "light" | "medium" | "heavy" | "shield";
  /** Base armor class provided by the armor */
  baseAc: number;
  /** Dexterity contribution behavior for AC */
  dexModifier: ArmorDexModifier;
  /** Whether the armor imposes disadvantage on stealth checks. */
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
  /** Resolved weapon property catalog entries, in source order. */
  properties: WeaponPropertyCatalogEntry[];
  /** Raw weapon property ids, preserved for predicate compatibility. */
  propertyIds: WeaponPropertyId[];
  /** Range of the weapon e.g., "5 ft", "150/600 ft" */
  range: string;
  /** ID of the item required to fire this weapon, if applicable */
  ammoItemId?: string;
  /** Derived weapon behavior used by runtime logic. */
  rules: WeaponRules;
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
  /** Custom value in copper pieces for the item instance */
  cpCost?: number;
  /** Custom lore text for the item instance */
  lore?: {
    shortDescription: string;
    fullText?: string;
  };
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
  /** Versatile mode for weapons that support it (Phase 8) */
  versatileMode?: "one-handed" | "two-handed";
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
  /** Cost of the item in copper pieces */
  cpCost: number;

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

export interface RawItemData extends Omit<ItemData, "weaponProperties"> {
  weaponProperties?: RawWeaponProperties;
}

export interface ItemCategoryData {
  /** Unique identifier for the item category */
  id: string;
  /** Display name of the category */
  name: string;
  /** IDs of items that belong to this category */
  itemIds: string[];
}
