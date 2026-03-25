export type ItemType = "gear" | "weapon" | "armor" | "tool" | "magic_item";

export type WeaponCategory = 'simple_melee' | 'martial_melee' | 'simple_ranged' | 'martial_ranged';
export type WeaponProperty = 'finesse' | 'light' | 'heavy' | 'two-handed' | 'thrown' | 'ammunition' | 'versatile' | 'reach';

export interface ArmorProperties {
  armorType: "light" | "medium" | "heavy" | "shield";
  baseAc: number;
  stealthDisadvantage: boolean;
  strengthRequirement?: number;
}

export interface WeaponProperties {
  category: WeaponCategory;
  damageDice: string; // e.g., "1d8"
  damageType: string; // e.g., "slashing", "piercing"
  properties: WeaponProperty[];
  range: string; // e.g., "5 ft", "150/600 ft"
  ammoItemId?: string; // ID of item required to fire this weapon
}

export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  weight: number; // in pounds

  lore: {
    short_description: string;
    full_text?: string;
  };

  // Optional; only present if type === 'armor'
  armor_properties?: ArmorProperties;

  weaponProperties?: WeaponProperties;

  // TODO: add modifiers, etc
}
