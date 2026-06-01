import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ClassAndLevelDisplay } from "./ClassAndLevelDisplay";
import type { CharacterClassEntry } from "../IdentityHeader";

const makeClass = (
  classId: string,
  className: string,
  level: number,
  subclassName?: string,
): CharacterClassEntry => ({
  classId,
  className,
  level,
  subclassName,
});

const meta: Meta<typeof ClassAndLevelDisplay> = {
  title: "IdentityHeader/ClassAndLevelDisplay",
  component: ClassAndLevelDisplay,
  tags: ["autodocs"],
  args: {
    onClick: fn(),
    classes: [],
  },
};

export default meta;

type Story = StoryObj<typeof ClassAndLevelDisplay>;

export const EmptySelection: Story = {
  args: {
    classes: [],
  },
};

export const SingleClass: Story = {
  args: {
    classes: [makeClass("fighter", "Fighter", 5)],
  },
};

export const SingleSubclass: Story = {
  args: {
    classes: [makeClass("wizard", "Wizard", 9, "School of Evocation")],
  },
};

export const TwoClassMulticlass: Story = {
  args: {
    classes: [
      makeClass("rogue", "Rogue", 3),
      makeClass("ranger", "Ranger", 2),
    ],
  },
};

export const MixedSubclassMulticlass: Story = {
  args: {
    classes: [
      makeClass("warlock", "Warlock", 5, "Fiend"),
      makeClass("paladin", "Paladin", 4, "Oath of Vengeance"),
      makeClass("fighter", "Fighter", 1),
    ],
  },
};

export const ClickInteraction: Story = {
  args: {
    classes: [makeClass("bard", "Bard", 6, "College of Lore")],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Class & Level"));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Playground: Story = {};