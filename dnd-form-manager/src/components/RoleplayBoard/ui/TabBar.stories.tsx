import type { Meta, StoryObj } from "@storybook/react-vite";
import { TabBar } from "./TabBar";
import { fn } from "storybook/test";

const tabs = [
  { id: "features", label: "FEATURES & TRAITS" },
  { id: "characteristics", label: "CHARACTERISTICS" },
  { id: "biography", label: "BIOGRAPHY" },
  { id: "spellbook", label: "SPELLBOOK" },
];

const meta: Meta<typeof TabBar> = {
  title: "RoleplayBoard/TabBar",
  component: TabBar,
  tags: ["autodocs"],
  args: { tabs, onChange: fn() },
};
export default meta;

type Story = StoryObj<typeof TabBar>;

export const Features: Story = { args: { activeId: "features" } };

export const Spellbook: Story = { args: { activeId: "spellbook" } };

export const Characteristics: Story = { args: { activeId: "characteristics" } };
