import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { IdentityHeader, type CharacterClassEntry } from "./IdentityHeader";

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

const meta: Meta<typeof IdentityHeader> = {
  title: "IdentityHeader/IdentityHeader",
  component: IdentityHeader,
  tags: ["autodocs"],
  args: {
    characterName: "Arannis Duskwhisper",
    playerName: "Mira",
    alignment: "Neutral Good",
    classes: [makeClass("fighter", "Fighter", 5)],
    raceNameDisplay: "Elf",
    backgroundNameDisplay: "Soldier",
    xp: 7000,
    levelUpMode: "xp",
    onCharacterNameChange: fn(),
    onPlayerNameChange: fn(),
    onAlignmentChange: fn(),
    onXpChange: fn(),
    onLevelUpModeChange: fn(),
    onClassModalClick: fn(),
    onBackgroundModalClick: fn(),
    onRaceModalClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof IdentityHeader>;

export const NewAdventurer: Story = {
  args: {
    characterName: "",
    playerName: "",
    alignment: "",
    classes: [],
    raceNameDisplay: "",
    backgroundNameDisplay: "",
    xp: 0,
    levelUpMode: "xp",
  },
};

export const FighterLevel5: Story = {
  args: {
    characterName: "Arannis Duskwhisper",
    playerName: "Mira",
    alignment: "Neutral Good",
    classes: [makeClass("fighter", "Fighter", 5)],
    raceNameDisplay: "Elf",
    backgroundNameDisplay: "Soldier",
    xp: 7000,
    levelUpMode: "xp",
  },
};

export const MilestoneCampaign: Story = {
  args: {
    characterName: "Sera Vale",
    playerName: "Jon",
    alignment: "Chaotic Neutral",
    classes: [makeClass("wizard", "Wizard", 9, "School of Evocation")],
    raceNameDisplay: "Human",
    backgroundNameDisplay: "Sage",
    xp: 0,
    levelUpMode: "milestone",
  },
};

export const MulticlassHero: Story = {
  args: {
    characterName: "Kade Ironstep",
    playerName: "Alex",
    alignment: "Lawful Neutral",
    classes: [
      makeClass("fighter", "Fighter", 4, "Champion"),
      makeClass("rogue", "Rogue", 2),
    ],
    raceNameDisplay: "Half-Orc",
    backgroundNameDisplay: "Outlander",
    xp: 14000,
    levelUpMode: "xp",
  },
};

export const MaxLevelHero: Story = {
  args: {
    characterName: "Iria the Unbound",
    playerName: "Sam",
    alignment: "Neutral",
    classes: [makeClass("wizard", "Wizard", 20)],
    raceNameDisplay: "Tiefling",
    backgroundNameDisplay: "Hermit",
    xp: 400000,
    levelUpMode: "xp",
  },
};

export const Interactions: Story = {
  args: {
    characterName: "Kestrel",
    playerName: "Dana",
    alignment: "Chaotic Good",
    classes: [makeClass("bard", "Bard", 6, "College of Lore")],
    raceNameDisplay: "Halfling",
    backgroundNameDisplay: "Entertainer",
    xp: 12000,
    levelUpMode: "xp",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.clear(canvas.getByPlaceholderText("Character Name"));
    await userEvent.type(canvas.getByPlaceholderText("Character Name"), "Kael");
    await expect(args.onCharacterNameChange).toHaveBeenCalled();

    await userEvent.click(canvas.getByText("Class & Level"));
    await expect(args.onClassModalClick).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByText("Background"));
    await expect(args.onBackgroundModalClick).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByText("Race"));
    await expect(args.onRaceModalClick).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByTitle("Currently using xp leveling"));
    await expect(args.onLevelUpModeChange).toHaveBeenCalledWith("milestone");
  },
};

export const Playground: Story = {
  args: {},
};
