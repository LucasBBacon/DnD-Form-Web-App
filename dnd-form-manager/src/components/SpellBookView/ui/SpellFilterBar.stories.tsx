import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpellFilterBar } from "./SpellFilterBar";
import { fn } from "storybook/test";

const classLabelMap = new Map([
  ["wizard", "Wizard"],
  ["cleric", "Cleric"],
  ["druid", "Druid"],
]);

const meta: Meta<typeof SpellFilterBar> = {
  title: "SpellBookView/SpellFilterBar",
  component: SpellFilterBar,
  tags: ["autodocs"],
  args: {
    selectedLevel: "all",
    selectedSchool: "all",
    selectedClassId: "all",
    availabilityFilter: "all",
    levelOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    schoolOptions: ["abjuration", "evocation", "illusion", "necromancy"],
    classOptions: ["wizard", "cleric", "druid"],
    classLabelMap,
    onLevelChange: fn(),
    onSchoolChange: fn(),
    onClassChange: fn(),
    onAvailabilityChange: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof SpellFilterBar>;

export const Default: Story = {};

export const Filtered: Story = {
  args: {
    selectedLevel: "3",
    selectedSchool: "evocation",
    selectedClassId: "wizard",
    availabilityFilter: "eligible",
  },
};
