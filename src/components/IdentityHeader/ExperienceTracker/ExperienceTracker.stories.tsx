import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ExperienceTracker } from "./ExperienceTracker";
import type { CharacterClassEntry } from "../IdentityHeader";

const makeClass = (
  classId: string,
  className: string,
  level: number,
): CharacterClassEntry => ({
  classId,
  className,
  level,
});

const level5Classes = [makeClass("fighter", "Fighter", 5)];

const meta: Meta<typeof ExperienceTracker> = {
  title: "IdentityHeader/ExperienceTracker",
  component: ExperienceTracker,
  tags: ["autodocs"],
  args: {
    xp: 7000,
    classes: level5Classes,
    levelUpMode: "xp",
    onXpChange: fn(),
    onModeChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ExperienceTracker>;

export const XpModeMidProgress: Story = {
  args: {
    xp: 7000,
    classes: level5Classes,
    levelUpMode: "xp",
  },
};

export const XpModeAtLevelStart: Story = {
  args: {
    xp: 6500,
    classes: level5Classes,
    levelUpMode: "xp",
  },
};

export const XpModeBelowCurrentThreshold: Story = {
  args: {
    xp: 0,
    classes: level5Classes,
    levelUpMode: "xp",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates clamped progress (0%) when XP is below the class-derived current level threshold.",
      },
    },
  },
};

export const MilestoneMode: Story = {
  args: {
    xp: 7000,
    classes: level5Classes,
    levelUpMode: "milestone",
  },
};

export const MaxLevelInXpMode: Story = {
  args: {
    xp: 400000,
    classes: [makeClass("wizard", "Wizard", 20)],
    levelUpMode: "xp",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows level 20 behavior where the next-level target is capped and the progress bar is hidden.",
      },
    },
  },
};

export const MultiClassTotalLevelProgress: Story = {
  args: {
    xp: 15000,
    classes: [
      makeClass("fighter", "Fighter", 3),
      makeClass("rogue", "Rogue", 3),
    ],
    levelUpMode: "xp",
  },
};

export const ToggleModeInteraction: Story = {
  args: {
    xp: 7000,
    classes: level5Classes,
    levelUpMode: "xp",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onModeChange).toHaveBeenCalledWith("milestone");
  },
};

export const XpInputInteraction: Story = {
  args: {
    xp: 7000,
    classes: level5Classes,
    levelUpMode: "xp",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "9000");
    await expect(args.onXpChange).toHaveBeenLastCalledWith(9000);
  },
};

export const Playground: Story = {};
