export type ItemType = "gear" | "weapon" | "armor" | "tool" | "magic_item";

export interface ArmorProperties {
  armorType: "light" | "medium" | "heavy" | "shield";
  baseAc: number;
  stealthDisadvantage: boolean;
  strengthRequirement?: number;
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

  // TODO: add weaponProperties, modifiers, etc
}
