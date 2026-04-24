import type { UUID } from "./common";

export type ItemType = "gear" | "weapon" | "armor" | "tool" | "magic_item";

export type WeaponCategory = 'simple_melee' | 'martial_melee' | 'simple_ranged' | 'martial_ranged';
export type WeaponProperty = 'finesse' | 'light' | 'heavy' | 'two-handed' | 'thrown' | 'ammunition' | 'versatile' | 'reach' | 'loading';
export type ItemStackMode = "stack" | "instance";

export interface ArmorProperties {
  armorType: "light" | "medium" | "heavy" | "shield";
  baseAc: number;
  stealthDisadvantage: boolean;
  strengthRequirement?: number;
}

export interface WeaponProperties {
  category: WeaponCategory;
  damageDice: string; // e.g., "1d8"
  versatileDamageDice?: string; // e.g., "1d10" for versatile weapons
  damageType: string; // e.g., "slashing", "piercing"
  properties: WeaponProperty[];
  range: string; // e.g., "5 ft", "150/600 ft"
  ammoItemId?: string; // ID of item required to fire this weapon
}

export interface MagicItemProperties {
  bonusToAttack?: number;
  bonusToDamage?: number;
  bonusToAc?: number;
  requiresAttunement: boolean;
}

export interface ItemStackingRules {
  mode: ItemStackMode;
  bundleSize?: number;
  maxBundleCount?: number;
}

export interface ItemInstanceOverrides {
  name?: string;
  weight?: number;
  armorProperties?: ArmorProperties;
  weaponProperties?: WeaponProperties;
  magicItemProperties?: MagicItemProperties;
}

export interface ItemInstanceData {
  instanceId: UUID;
  baseItemId: string;
  customName?: string;
  notes?: string;
  tags?: string[];
  overrides?: ItemInstanceOverrides;
  createdFromCatalogBaseItemId?: string;
  isCustom?: boolean;
}

export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  weight: number; // in pounds

  lore: {
    shortDescription: string;
    fullText?: string;
  };

  // Optional; only present if type === 'armor'
  armorProperties?: ArmorProperties;

  weaponProperties?: WeaponProperties;
  magicItemProperties?: MagicItemProperties;
  stacking?: ItemStackingRules;

  // TODO: add modifiers, etc
}
