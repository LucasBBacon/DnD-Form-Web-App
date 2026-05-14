import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EquipmentCard } from "./EquipmentCard";
import type { InventoryBoardItemData } from "../InventoryBoardView";
import type { ArmorProperties, WeaponProperties } from "../../../types/item";
import { formatCpAsMaxCoinValue } from "../../../utils/currencyUtils";

const formatItemCost = (cpCost: number): string => formatCpAsMaxCoinValue(cpCost);

const ammunitionProperty: WeaponProperties["properties"][number] = {
  id: "property_ammunition",
  name: "Ammunition",
  lore: {
    shortDescription: "Requires arrows, bolts, or similar ammunition.",
    fullText:
      "You can use a weapon with the ammunition property to make a ranged attack only if you have ammunition to fire from the weapon. Each time you attack with the weapon, you expend one piece of ammunition.",
  },
};

const heavyProperty: WeaponProperties["properties"][number] = {
  id: "property_heavy",
  name: "Heavy",
  lore: {
    shortDescription: "Large enough that Small creatures have disadvantage.",
    fullText:
      "Small creatures have disadvantage on attack rolls with heavy weapons. Heavy weapons are designed for larger wielders and hit harder at the cost of flexibility.",
  },
};

const twoHandedProperty: WeaponProperties["properties"][number] = {
  id: "property_two_handed",
  name: "Two-Handed",
  lore: {
    shortDescription: "Requires two hands to attack.",
    fullText:
      "This weapon requires two hands to use when making an attack. It cannot be used in one hand while attacking.",
  },
};

const longbowProperties: WeaponProperties = {
  category: "martial_ranged",
  damageDice: "1d8",
  damageType: "piercing",
  properties: [ammunitionProperty, heavyProperty, twoHandedProperty],
  propertyIds: ["property_ammunition", "property_heavy", "property_two_handed"],
  range: "150/600 ft",
  ammoItemId: "item_ammo_arrow",
  rules: {
    attackAbility: "dex",
    isRangedWeapon: true,
    meleeReachFeet: 5,
    range: { normal: 150, long: 600 },
    requiresAmmunition: true,
    loading: false,
    light: false,
    heavy: true,
    twoHanded: true,
    special: false,
    finesse: false,
    versatile: false,
  },
};

const chainMailArmorProperties: ArmorProperties = {
  acApplication: "set",
  armorType: "heavy",
  baseAc: 16,
  dexModifier: {
    mode: "none",
  },
  stealthDisadvantage: true,
  strengthRequirement: 13,
};

const shieldArmorProperties: ArmorProperties = {
  acApplication: "bonus",
  armorType: "shield",
  baseAc: 2,
  dexModifier: {
    mode: "none",
  },
  stealthDisadvantage: false,
};

const weaponItem: InventoryBoardItemData = {
  name: "Longbow",
  type: "weapon",
  weight: 2,
  cpCost: 5000,
  stacking: {
    mode: "instance",
  },
  lore: {
    shortDescription:
      "A powerful ranged weapon favored by skilled archers for its long range and high damage potential.",
    fullText:
      "A longbow is a powerful ranged weapon that has been used for centuries by archers and hunters. It is characterized by its long, slender design, which allows for greater draw length and increased range compared to shorter bows. The longbow is typically made from a single piece of wood, such as yew or ash, and is known for its simplicity and effectiveness in combat. It requires significant strength and skill to use effectively, but in the hands of a skilled archer, the longbow can deliver devastating attacks from a distance.",
  },
  weaponProperties: longbowProperties,
};

const heavyArmorItem: InventoryBoardItemData = {
  name: "Chain Mail",
  type: "armor",
  weight: 55,
  cpCost: 7500,
  stacking: {
    mode: "instance",
  },
  lore: {
    shortDescription:
      "Heavy armor made of interlocking metal rings, providing strong protection at the cost of mobility.",
    fullText:
      "Made of interlocking metal rings, chain mail includes a layer of quilted fabric worn underneath the mail to prevent chafing and to cushion the impact of blows. The suit includes gauntlets and a heavy coif, offering strong protection at the cost of mobility.",
  },
  armorProperties: chainMailArmorProperties,
};

const shieldItem: InventoryBoardItemData = {
  name: "Shield",
  type: "armor",
  weight: 6,
  cpCost: 1000,
  stacking: {
    mode: "instance",
  },
  lore: {
    shortDescription: "A shield is made from wood or metal and is carried in one hand.",
    fullText:
      "A shield is made from wood or metal and is carried in one hand. Wielding a shield increases your Armor Class by 2. You can benefit from only one shield at a time.",
  },
  armorProperties: shieldArmorProperties,
};

const magicItem: InventoryBoardItemData = {
  name: "Ring of Protection",
  type: "magic_item",
  weight: 0,
  cpCost: 50000,
  stacking: {
    mode: "instance",
  },
  lore: {
    shortDescription: "A classic attunement item that grants a protective magical bonus.",
    fullText:
      "While wearing this ring, you gain a +1 bonus to AC and saving throws. The ring requires attunement and is one of the classic 2014 magic items that rewards a cautious frontliner.",
  },
  magicItemProperties: {
    bonusToAc: 1,
    requiresAttunement: true,
  },
};

const explorersPackItem: InventoryBoardItemData = {
  name: "Explorer's Pack",
  type: "gear",
  weight: 59,
  cpCost: 1000,
  stacking: {
    mode: "instance",
  },
  lore: {
    shortDescription:
      "A pack designed for adventurers and explorers, containing essential items for survival and exploration.",
    fullText:
      "A pack that includes a backpack, a bedroll, a mess kit, a tinderbox, 10 torches, 10 days of rations, and a waterskin. The pack also has 50 feet of hempen rope strapped to the side of it.",
  },
};

const meta: Meta<typeof EquipmentCard> = {
  title: "InventoryBoard/EquipmentCard",
  component: EquipmentCard,
  tags: ["autodocs"],
  args: {
    instanceId: "inst-1",
    isEquipped: false,
    itemData: weaponItem,
    requiresAttunement: false,
    isAttuned: false,
    isWeapon: true,
    isArmor: false,
    attunedInstanceIds: [],
    onToggleAttunement: fn(),
    onToggleWeaponEquip: fn(),
    onToggleArmorEquip: fn(),
    onDropInstance: fn(),
    formatItemCost,
  },
  parameters: {
    layout: "padded",
  },
  render: (args) => (
    <div style={{ maxWidth: "900px" }}>
      <EquipmentCard {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof EquipmentCard>;

export const EquippedWeapon: Story = {
  args: {
    itemData: weaponItem,
    isWeapon: true,
    isArmor: false,
    isEquipped: true,
  },
};

export const HeavyArmorUnequipped: Story = {
  args: {
    itemData: heavyArmorItem,
    isWeapon: false,
    isArmor: true,
    isEquipped: false,
  },
};

export const EquippedShield: Story = {
  args: {
    itemData: shieldItem,
    isWeapon: false,
    isArmor: true,
    isEquipped: true,
  },
};

export const AttunedMagicItem: Story = {
  args: {
    itemData: magicItem,
    isWeapon: false,
    isArmor: false,
    requiresAttunement: true,
    isAttuned: true,
    attunedInstanceIds: ["inst-2", "inst-3", "inst-4"],
  },
};

export const AttunementSlotsFull: Story = {
  args: {
    itemData: magicItem,
    isWeapon: false,
    isArmor: false,
    requiresAttunement: true,
    isAttuned: false,
    attunedInstanceIds: ["inst-2", "inst-3", "inst-4"],
  },
};

export const UtilityItemNoEquipControls: Story = {
  args: {
    itemData: explorersPackItem,
    isWeapon: false,
    isArmor: false,
    requiresAttunement: false,
    isAttuned: false,
    attunedInstanceIds: [],
  },
};
