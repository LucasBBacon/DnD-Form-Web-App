import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EquipmentCard } from "./EquipmentCard";
import type { InventoryBoardItemData } from "../InventoryBoardView";

const formatItemCost = (cpCost: number): string => `${cpCost} CP`;

const weaponItem: InventoryBoardItemData = {
	name: "Longsword",
	type: "weapon",
	weight: 3,
	cpCost: 1500,
	lore: {
		shortDescription: "A versatile martial weapon.",
	},
};

const heavyArmorItem: InventoryBoardItemData = {
	name: "Chain Mail",
	type: "armor",
	weight: 55,
	cpCost: 7500,
	lore: {
		shortDescription: "Heavy interlocking metal armor.",
	},
	armorProperties: {
		armorType: "heavy",
	},
};

const shieldItem: InventoryBoardItemData = {
	name: "Shield",
	type: "armor",
	weight: 6,
	cpCost: 1000,
	lore: {
		shortDescription: "A strapped defensive shield.",
	},
	armorProperties: {
		armorType: "shield",
	},
};

const magicItem: InventoryBoardItemData = {
	name: "Ring of Protection",
	type: "wondrous_item",
	weight: 0,
	cpCost: 50000,
	lore: {
		shortDescription: "Grants a protective magical bonus.",
	},
	magicItemProperties: {
		requiresAttunement: true,
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
		itemData: {
			name: "Traveler's Clothes",
			type: "adventuring_gear",
			weight: 4,
			cpCost: 200,
			lore: {
				shortDescription: "Simple practical clothing.",
			},
		},
		isWeapon: false,
		isArmor: false,
		requiresAttunement: false,
		isAttuned: false,
		attunedInstanceIds: [],
	},
};
