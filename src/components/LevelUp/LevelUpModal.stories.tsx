import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { CharacterState } from "../../store/useCharacterStore";
import { LevelUpModal } from "./LevelUpModal";
import { StoryCharacterState } from "./LevelUpStoryHelpers";

const meta = {
  title: "Flows/LevelUp/LevelUpModal",
  component: LevelUpModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof LevelUpModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const singleClassState: Partial<CharacterState> = {
  level: 4,
  classId: "class_fighter",
  subclassId: "subclass_fighter_champion",
  classTracks: [
    {
      classId: "class_fighter",
      subclassId: "subclass_fighter_champion",
      level: 4,
    },
  ],
  baseAbilityScores: {
    str: 16,
    dex: 12,
    con: 15,
    int: 10,
    wis: 10,
    cha: 8,
  },
};

const multiclassState: Partial<CharacterState> = {
  level: 7,
  classId: "class_fighter",
  subclassId: "subclass_fighter_champion",
  classTracks: [
    {
      classId: "class_fighter",
      subclassId: "subclass_fighter_champion",
      level: 5,
    },
    {
      classId: "class_wizard",
      subclassId: null,
      level: 2,
    },
  ],
  spellsKnown: ["spell_acid_splash", "spell_burning_hands", "spell_charm_person"],
  choicesByLevel: {
    2: { selectedClassId: "class_fighter", hpGained: 7 },
    3: { selectedClassId: "class_fighter", hpGained: 8 },
    4: { selectedClassId: "class_fighter", hpGained: 8 },
    5: { selectedClassId: "class_fighter", hpGained: 7 },
    6: { selectedClassId: "class_wizard", hpGained: 4 },
    7: { selectedClassId: "class_wizard", hpGained: 4 },
  },
};

export const SingleClassLevelUp: Story = {
  args: {
    targetLevel: 5,
    isBlocking: false,
  },
  render: (args) => (
    <StoryCharacterState state={singleClassState}>
      <LevelUpModal {...args} />
    </StoryCharacterState>
  ),
};

export const BlockingLevelUp: Story = {
  args: {
    targetLevel: 5,
    isBlocking: true,
  },
  render: (args) => (
    <StoryCharacterState state={singleClassState}>
      <LevelUpModal {...args} />
    </StoryCharacterState>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const closeButton = canvas.getByRole("button", { name: "Close" });
    await expect(closeButton).toBeDisabled();
  },
};

export const MulticlassDecisionFlow: Story = {
  args: {
    targetLevel: 8,
    isBlocking: false,
  },
  render: (args) => (
    <StoryCharacterState state={multiclassState}>
      <LevelUpModal {...args} />
    </StoryCharacterState>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};
