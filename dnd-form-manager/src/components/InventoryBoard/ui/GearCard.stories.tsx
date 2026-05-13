import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GearCard } from "./GearCard";
import type { InventoryBoardItemData } from "../InventoryBoardView";

const formatItemCost = (cpCost: number): string => `${cpCost} CP`;

const rations: InventoryBoardItemData = {
	name: "Rations",
	type: "adventuring_gear",
	weight: 2,
	cpCost: 50,
	lore: {
		shortDescription: "One day of preserved trail food.",
	},
};

const rope: InventoryBoardItemData = {
	name: "Hempen Rope (50 ft)",
	type: "adventuring_gear",
	weight: 10,
	cpCost: 100,
	lore: {
		shortDescription: "Durable rope for climbing and hauling.",
	},
};

const healingPotion: InventoryBoardItemData = {
	name: "Potion of Healing",
	type: "potion",
	weight: 0.5,
	cpCost: 5000,
	lore: {
		shortDescription: "Regain hit points when consumed.",
	},
};

const meta: Meta<typeof GearCard> = {
	title: "InventoryBoard/GearCard",
	component: GearCard,
	tags: ["autodocs"],
	args: {
		stackId: "stack-rations",
		baseItemId: "adventuring_gear_rations",
		itemData: rations,
		quantity: 3,
		onStackIncrement: fn(),
		onStackDecrement: fn(),
		formatItemCost,
	},
	parameters: {
		layout: "padded",
	},
	render: (args) => (
		<div style={{ maxWidth: "900px" }}>
			<GearCard {...args} />
		</div>
	),
};

export default meta;

type Story = StoryObj<typeof GearCard>;

export const TypicalBackpackStack: Story = {};

export const SingleHeavyUtility: Story = {
	args: {
		stackId: "stack-rope",
		baseItemId: "adventuring_gear_rope_hempen_50ft",
		itemData: rope,
		quantity: 1,
	},
};

export const BulkSupplies: Story = {
	args: {
		stackId: "stack-rations-bulk",
		baseItemId: "adventuring_gear_rations",
		itemData: rations,
		quantity: 25,
	},
};

export const PremiumConsumables: Story = {
	args: {
		stackId: "stack-healing-potion",
		baseItemId: "potion_healing",
		itemData: healingPotion,
		quantity: 4,
	},
};
